import * as Minio from 'minio'

const S3_CLIENT = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT,
    port: process.env.S3_PORT,
    useSSL: process.env.S3_SSL == "true" ? true : false,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
})

const bucket = process.env.S3_BUCKET

export async function uploadNewObject(objectName, data, contentType) {
    try {
        await S3_CLIENT.putObject(bucket, objectName, data, {
            'Content-Type': contentType || 'application/octet-stream'
        })

        console.log(`Successfully uploaded ${objectName} to bucket ${bucket}`)
    } catch (err) {
        console.error('Error uploading object:', err)
        throw err
    }
}

export async function removeObject(objectName) {
    try {
        await S3_CLIENT.removeObject(bucket, objectName)
        console.log(`Successfully remove ${objectName} from bucket ${bucket}`)
    } catch (err) {
        console.error('Error remove object:', err)
        throw err
    }
}

export async function copyObject(src, dest) {
    try {
        await S3_CLIENT.copyObject(bucket, dest,  `/${bucket}/${src}`)
        console.log(`Successfully copy ${src} to ${dest}`)
    } catch (err) {
        console.error('Error copy object:', err)
        throw err
    }
}