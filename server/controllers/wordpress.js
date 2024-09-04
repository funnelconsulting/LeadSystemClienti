const Lead = require('../models/lead');
const LeadWordpress = require('../models/leadWordpress');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const axios = require('axios')
const path = require("path");
const fs = require('fs').promises;
const process = require('process');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
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
    console.log('Autenticato')
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  console.log('Autenticato')
  return client;
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
const writeDataSalespark = async (auth, lead) => {
  const sheets = google.sheets({ version: 'v4', auth });
  console.log(lead)
    const leadData = [
      lead.data ? formatDate(new Date(lead.data)) : '', 
      lead.nome,
      lead.cognome,
      lead.email,
      lead.numeroTelefono,
    ];  

  const resource = {
    values: [leadData],
  };
  sheets.spreadsheets.values.append(
    {
      spreadsheetId: '1EoiU3qQtEjH8VkfCKngu0auYzz2nv4dH3kWa-7aKh60',
      range: 'Lead-Salespark!A1',
      valueInputOption: 'RAW',
      resource: resource,
    },
    async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          '%d cells updated on range: %s',
          result.data.updates.updatedCells,
          result.data.updates.updatedRange
        );
      }
    }
  );
}

const runExportSales = (lead) => {
  authorize()
    .then((auth) => writeDataSalespark(auth, lead))
    .catch(console.error);
};

exports.getDataFromWordpress = async (req, res) => { // Converte il corpo della richiesta in una stringa JSON
    console.log(req.body);
    const nome = req.body.yourName;
    const cognome = req.body.yourSurname;
    const email = req.body.email;
    const numeroTelefono = req.body.number;
    const università = req.body.universita ? req.body.universita : null;
    const corsoDiLaurea = req.body.percorsodistudio ? req.body.percorsodistudio : null;
    const facolta = req.body.settore ? req.body.settore : null;   
    const utmCampaign = req.body.utm_campaign ? req.body.utm_campaign : '';
    const utmSource = req.body.utm_source ? req.body.utm_source : '';
    const universita = req.body.universita ? req.body.universita == 'Si' ? true : false : false;
    const lavoro = req.body.lavoro ? req.body.lavoro == 'Si' ? true : false : false;
    const orario = req.body.orario ? req.body.orario : '';
    const provincia = req.body.Provincia ? req.body.Provincia : '';
    try {
  
      console.log('webhook ricevuto', req.body);
      // Crea un nuovo oggetto LeadWordpress e mappa i campi
      const newLead = new LeadWordpress({
        data: new Date(),
        nome: nome,
        cognome: cognome,
        email: email,
        numeroTelefono: numeroTelefono,
        corsoDiLaurea: corsoDiLaurea,
        facolta: facolta,
        università: università,
        campagna: 'wordrpess',
        utmCampaign: utmCampaign,
        utmSource: utmSource,
        orario: orario,
        lavoro: lavoro,
        universita: universita,
        provincia: provincia,
      });
  
      // Salva il nuovo lead nel database dopo un timeout di 5 secondi
          await newLead.save();
          console.log('Lead salvato:', newLead);
          res.status(200).json({ success: true });
    } catch (error) {
      console.error('Errore durante il salvataggio del lead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  //https://leadsystemclienti-production.up.railway.app/api/salespark-lead
  exports.salesParkLead = async (req, res) => {
    console.log(req.body);
    const nome = req.body.Nome;
    const cognome = req.body.Cognome;
    const email = req.body.Email;
    const numeroTelefono = req.body.Telefono;
    const utmCampaign = req.body.utm_campaign ? req.body.utm_campaign : '';
    const utmSource = req.body.utm_source ? req.body.utm_source : '';
    const utmMedium = req.body.utm_medium ? req.body.utm_medium : '';
    const utmTerm = req.body.utm_term ? req.body.utm_term : '';
    try {
  
      const existingLeadAss = await Lead.findOne({ $or: [{ email }, { numeroTelefono }], utente: "66d175318a9d02febe47d4a9" });

      if (!existingLeadAss) {
        const newLead = new Lead({
          data: new Date(),
          nome: nome,
          cognome: cognome,
          email: email,
          numeroTelefono: numeroTelefono,
          utente: "66d175318a9d02febe47d4a9",
          campagna: 'Landing',
          esito: 'Da contattare',
          orientatori: null,
          note: '',
          fatturato: '',
          utmCampaign: utmCampaign,
          utmSource: utmSource,
          utmContent: utmMedium,
          utmTerm: utmTerm,
          utmAdgroup: "",
          utmAdset: "",
          appDate: "",
          summary: "",
          last_interaction: "",
          idLeadChatic: '',
          tag: "salespark",
          linkChat: "",
        });
    
          await newLead.save();
          runExportSales(newLead)
          console.log('Lead salvato:', newLead);
          res.status(200).json({ success: true });
      } else {
        console.log('Lead already exists');
        res.status(200).json({ success: true });
      }

    } catch (error) {
      console.error('Errore durante il salvataggio del lead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  
  
  
  
  
  