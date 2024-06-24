const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('YOUR_SPREADSHEET_ID');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const path = require("path")
const fs = require("fs").promises;

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const SPREADSHEET_ID = '1XlFKrMhiYy9zZemzEkcG3mzb1AH4zorSGV6LmX4k7mQ';
const RANGE = 'Sheet1'; 

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

    // Step 1: Leggere tutte le righe
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = getRows.data.values;

    const newRow = [
      new Date().toLocaleString(),
      lead.nome ? lead.nome : "",
      lead.cognome ? lead.cognome : "",
      lead.email ? lead.email : "",
      lead.numeroTelefono ? lead.numeroTelefono : "",
      lead.appDate ? lead.appDate : "",
      lead.master ? lead.master : "",
      lead.summary ? lead.summary : "",
    ];

    // Se non ci sono righe nel foglio, aggiungere la nuova riga
    if (!rows || rows.length === 0) {
      const appendRequest = {
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [newRow],
        },
      };

      const response = await sheets.spreadsheets.values.append(appendRequest);
      console.log(`${response.data.updates.updatedCells} cells appended.`);
      return;
    }

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][4] === lead.numeroTelefono) { // Modifica qui il criterio di ricerca
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      const appendRequest = {
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [newRow],
        },
      };

      const response = await sheets.spreadsheets.values.append(appendRequest);
      console.log(`${response.data.updates.updatedCells} cells appended.`);
    } else {
      // Step 4: Aggiornare la riga trovata
      const updateRequest = {
        spreadsheetId: SPREADSHEET_ID,
        range: `${RANGE}!A${rowIndex + 1}`, // Aggiungere 1 perché gli indici delle righe di Google Sheets partono da 1
        valueInputOption: 'RAW',
        resource: {
          values: [newRow],
        },
      };

      const response = await sheets.spreadsheets.values.update(updateRequest);
      console.log(`${response.data.updatedCells} cells updated.`);
    }
  } catch (err) {
    console.error('Errore nell\'aggiunta o aggiornamento della riga nel foglio di calcolo:', err.message);
  }
}