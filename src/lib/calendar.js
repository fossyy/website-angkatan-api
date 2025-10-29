import path from 'node:path';
import { google } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS = {
  type: 'service_account',
  project_id: process.env.CALENDAR_PROJECT_ID,
  private_key_id: process.env.CALENDAR_PRIVATE_KEY_ID,
  private_key: process.env.CALENDAR_PRIVATE_KEY,
  client_email: process.env.CALENDAR_CLIENT_EMAIL,
  client_id: process.env.CALENDAR_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.CALENDAR_CLIENT_X509_CERT_URL,
  universe_domain: 'googleapis.com',
}
const CALENDAR_IDS = {
  'Event Pacil': process.env.EVENT_PACIL_ID,
  'Event UI': process.env.EVENT_UI_ID,
  'Timeline PMB': process.env.TIMELINE_PMB_ID,
  'Birthday Pacil': process.env.BDAY_PACIL_ID,
}

export async function getCalendarClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: CREDENTIALS,
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