import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config';
import { copyObject, removeObject, uploadNewObject } from '../s3.js';
import { getImageByID, insertImage, removeImageByID, updateImageLink, updateImageTitle } from '../gallery.js';
import { insertArunglink, removeArungLinkBySlug } from '../arunglink.js';

export const startBot = async (token, clientId, guildId) => {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    });

    const commands = [
        new SlashCommandBuilder()
            .setName('image')
            .setDescription('Manage images')
            .addSubcommand(sub =>
                sub.setName('upload')
                    .setDescription('Upload a new image')
                    .addStringOption(opt => opt.setName('title').setDescription('Title of the image').setRequired(true))
                    .addStringOption(opt =>
                        opt.setName('type')
                            .setDescription('Type of the image (e.g., png, jpg, jpeg, gif)')
                            .setRequired(true)
                            .addChoices(
                                { name: 'png', value: 'png' },
                                { name: 'jpg', value: 'jpg' },
                                { name: 'jpeg', value: 'jpeg' },
                                { name: 'webp', value: 'webp' }
                            )
                    )
            )
            .addSubcommand(sub =>
                sub.setName('update')
                    .setDescription('Update image title')
                    .addIntegerOption(opt => opt.setName('id').setDescription('ID of the image').setRequired(true))
                    .addStringOption(opt => opt.setName('title').setDescription('New title').setRequired(true))
            )
            .addSubcommand(sub =>
                sub.setName('remove')
                    .setDescription('Remove an image by ID')
                    .addIntegerOption(opt => opt.setName('id').setDescription('ID of the image').setRequired(true))
            ),
        new SlashCommandBuilder()
            .setName('arunglink')
            .setDescription('Manage Arung links')
            .addSubcommand(sub =>
                sub.setName('add')
                    .setDescription('Add a new link')
                    .addStringOption(opt => opt.setName('title').setDescription('Title of the link').setRequired(true))
                    .addStringOption(opt =>
                        opt.setName('category')
                            .setDescription('Category')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Academic', value: 'academic' },
                                { name: 'Administration', value: 'administration' },
                                { name: 'Organization', value: 'organization' },
                                { name: 'Event', value: 'event' }
                            )
                    )
                    .addStringOption(opt => opt.setName('link').setDescription('URL of the link').setRequired(true))
                    .addStringOption(opt =>
                        opt.setName('slug')
                            .setDescription('Custom slug (type "auto" to generate automatically)')
                            .setRequired(true)
                    )
            )
            .addSubcommand(sub =>
                sub.setName('delete')
                    .setDescription('Delete a link by slug')
                    .addStringOption(opt => opt.setName('slug').setDescription('Slug of the link').setRequired(true))
            )
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Slash commands registered.');

    client.on('interactionCreate', async interaction => {
        if (!interaction.isChatInputCommand()) return;

        const cmd = interaction.commandName;
        const sub = interaction.options.getSubcommand();

        if (cmd === 'image') {
            if (sub === 'upload') {
                const title = interaction.options.getString('title');
                const type = interaction.options.getString('type');
                await interaction.reply({ content: `Upload gambar untuk **${title}**.`, ephemeral: true });

                const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', async m => {
                    const attachment = m.attachments.first();
                    const response = await fetch(attachment.url);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    uploadNewObject(`gallery/${title}.${type}`, buffer, `image/${type}`)
                    const id = await insertImage(title, `cdn.s3.filekeeper.my.id/angkatan/gallery/${title}.${type}`)
                    interaction.followUp({ content: `Image uploaded with ID **${id}**!` });
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.followUp({ content: 'No image uploaded. Operation cancelled.', ephemeral: true });
                    }
                });
            }

            else if (sub === 'update') {
                const id = interaction.options.getInteger('id');
                const title = interaction.options.getString('title');
                const link = await updateImageTitle(id, title)
                try {
                    const path = new URL(link.startsWith('http') ? link : `https://${link}`).pathname;
                    const parts = path.split('/').filter(Boolean);
                    parts.shift()
                    const oldPath = parts.join('/')
                    const oldFile = parts.pop()
                    parts.push(title + '.' + oldFile.split('.').at(-1))
                    const newPath = parts.join('/')
                    await copyObject(oldPath, newPath)
                    await removeObject(oldPath)
                    await updateImageLink(id, 'cdn.s3.filekeeper.my.id/angkatan/' + newPath)
                    await interaction.reply({ content: `Image with ID **${id}** has been updated to **${title}**!` });
                } catch (e) {
                    console.error(e)
                    await interaction.reply({ content: `Terjadi error saat update.` });
                }
            }

            else if (sub === 'remove') {
                const id = interaction.options.getInteger('id');
                try {
                    const image = await getImageByID(id)
                    const link = image.link
                    const path = new URL(link.startsWith('http') ? link : `https://${link}`).pathname;
                    const parts = path.split('/').filter(Boolean);
                    parts.shift()
                    const objectPath = parts.join('/')
                    await removeImageByID(id)
                    await removeObject(objectPath)
                    await interaction.reply({ content: `Image with ID **${id}** has been removed.` });
                } catch (err) {
                    console.error('Error removing image by ID:', err);
                    await interaction.reply({ content: `Error removing image.` });
                }
            }
        }

        else if (cmd === 'arunglink') {
            if (sub === 'add') {
                const title = interaction.options.getString('title');
                const category = interaction.options.getString('category');
                const link = interaction.options.getString('link');
                const slugInput = interaction.options.getString('slug');

                try {
                    const slug = await insertArunglink(title, category, link, slugInput);
                    await interaction.reply({
                        content: `Link added!\n• **Title:** ${title}\n• **Category:** ${category}\n• **Slug:** ${slug}\n`
                    });
                } catch (e) {
                    console.error('Error inserting ArungLink:', e);
                    await interaction.reply({ content: 'Gagal menambahkan link.' });
                }
            } else if (sub === 'delete') {
                const slug = interaction.options.getString('slug');
                try {
                    await removeArungLinkBySlug(slug);
                    await interaction.reply({ content: `Link with slug **${slug}** deleted.` });
                } catch (e) {
                    console.error('Error deleting ArungLink:', e);
                    await interaction.reply({ content: 'Gagal menghapus link.' });
                }
            }
        }
    });

    client.on('clientReady', () => {
        console.log(`Discord bot logged in as ${client.user.tag}`);
    });

    await client.login(token);

};
