import path from 'node:path';
import { google } from "googleapis";

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// TODO: fix pengambilan dari .env (pake json udah bener)
const CREDENTIALS = path.join(process.cwd(), 'calendar-project-476015.json')
const CALENDAR_ID = process.env.CALENDAR_ID

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

export async function getEventsPerMonth(year, month, calendarId = CALENDAR_ID) {
  try {
    const calendar = await getCalendarClient()

    const startDate = new Date(Date.UTC(year, month - 1, 1))
    const endDate = new Date(Date.UTC(year, month, 1))

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    })

    return {
      data: response.data.items,

    }

  } catch (e) {
    console.error('Error fetching monthly events:', e)
    throw e
  }
}