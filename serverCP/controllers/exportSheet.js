const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('YOUR_SPREADSHEET_ID');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const path = require("path")
const fs = require("fs")

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SPREADSHEET_ID = '1XlFKrMhiYy9zZemzEkcG3mzb1AH4zorSGV6LmX4k7mQ';

async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }
  
  async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }
  
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await google.auth.getClient({
      scopes: SCOPES,
      keyFile: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

/*exports.appendToGoogleSheet = async (lead) => {
  try {
    const authClient = await authorize();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useOAuth2Client(authClient);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      Nome: lead.nome,
      Cognome: lead.cognome,
      Email: lead.email,
      Telefono: lead.numeroTelefono,
      Data: new Date().toLocaleString(),
      Note: lead.note,
      Campagna: lead.campagna,
      Esito: lead.esito,
      // Aggiungi altri campi che vuoi trascrivere
    });

    console.log('Lead trascritto su Google Sheets');
  } catch (error) {
    console.error('Errore nella trascrizione su Google Sheets', error);
  }
}*/

exports.appendToGoogleSheet = async (lead) => {
  try {
    const authClient = await authorize();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const newRow = {
      Data: new Date().toLocaleString(),
      Nome: lead.nome ? lead.nome : "",
      Cognome: lead.cognome ? lead.cognome : "",
      Email: lead.email ? lead.email : "",
      Telefono: lead.numeroTelefono ? lead.numeroTelefono : "",
      "Data appuntamento": lead.appDate ? lead.appDate : "",
      Master: lead.master ? lead.master : "",
      Sommario: lead.summary ? lead.summary : "",
    };

    const values = [Object.values(newRow)];

    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: values,
      },
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log(`${response.data.updates.updatedCells} cells appended.`);
  } catch (err) {
    console.error('Errore nell\'aggiunta della riga al foglio di calcolo:', err.message);
  }
}