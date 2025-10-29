import path from 'node:path';
import { google } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// TODO: fix pengambilan dari .env (pake json udah bener)
const CREDENTIALS = path.join(process.cwd(), 'calendar-credentials.json')
const CALENDAR_IDS = {
  'Event Pacil': process.env.EVENT_PACIL_ID,
  'Event UI': process.env.EVENT_UI_ID,
  'Timeline PMB': process.env.TIMELINE_PMB_ID,
  'Birthday Pacil': process.env.BDAY_PACIL_ID,
}

export async function getCalendarClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFilename: CREDENTIALS,
      // email: process.env.CALENDAR_CLIENT_EMAIL,
      // key: process.env.CALENDAR_PRIVATE_KEY,
      scopes: SCOPES,
    });
      
    return google.calendar({ version: 'v3', auth });
  } catch (e) {
    console.error('Error authenticating:', e)
    throw e
  }
}

export async function getEvents(year, month, date = 0) {
  try {
    const calendar = await getCalendarClient()

    const startDate = date
    ? new Date(Date.UTC(year, month - 1, date))
    : new Date(Date.UTC(year, month - 1, 1));

    const endDate = date
      ? new Date(Date.UTC(year, month - 1, date + 1))
      : new Date(Date.UTC(year, month, 1));
    
    const allEvents = await Promise.all(
      Object.entries(CALENDAR_IDS).map(async ([key, calendarId]) => {
        const response = await calendar.events.list({
          calendarId: calendarId,
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          fields: 'items(id,summary,description,start,end,location)'
        });
        
        return response.data.items.map(event => ({
          id: event.id || "",
          event_type: key,
          summary: event.summary || "",
          description: event.description || "",
          start: event.start.dateTime || "",
          end: event.end.dateTime || "",
          location: event.location || "",
          startDate: event.start.dateTime ? 
            event.start.dateTime.split('T')[0] : 
            event.start.date || ""
        }));
      })
    ).then(responses => responses.flat());

    return allEvents
  } catch (e) {
    console.error('Error fetching events:', e)
    throw e
  }
}