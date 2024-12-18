const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require("dotenv").config();
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const axios = require('axios')
const path = require("path");
const cron = require('node-cron');
const { parse } = require('json2csv');
const LeadChatbot = require('./models/leadChatbot');
const moment = require('moment');
const { saveLeadChatbotUnusual, saveLeadSMC, saveLeadLuiss, saveLeadVantaggio, saveLeadDemo, saveLeadLifeGen, saveLeadMira, saveLeadSMCNew, saveLeadUnusualNew, saveLeadLuissNew, saveLeadSunlight, saveLeadVideoAnimate } = require('./controllers/chatbot');
const { appendToGoogleSheet } = require('./controllers/exportSheet');
const Lead = require('./models/lead');
const { saveChatboltLead } = require('./controllers/newChatbolt');

const app = express();
app.use(express.urlencoded({ extended: true }));
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB Connessoo!"))
  .catch((err) => console.log("DB Connection Error ", err));

  app.use(express.static(path.join(__dirname, 'client', 'public')));

app.use(express.json({ limit: "10mb" }));
app.use(cors());

async function exportChatbot(auth) {
  try {
    const dataToUpdate = [];
    const sheets = google.sheets({ version: 'v4', auth });
    const leadChatbots = await LeadChatbot.find();
    leadChatbots.forEach((lead) => {
      const leadData = [
        lead.data ? lead.data : '', 
        lead.fullName,
        lead.nome,
        lead.cognome,
        lead.numeroTelefono,
        lead.email,
        lead.idLead,
        lead.channel,
        lead.appointment_date || '',
        lead.last_interaction,
        lead.conversation_summary || ''
      ];
    
      dataToUpdate.push(leadData);
    });
  
    const resource = {
      values: dataToUpdate,
    };
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: '1q0U8F3YcSQkF9eLVYf3O8Umu6wRWMSwFWvfmXnj_1wI',
        range: 'gpt!A1',
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
  } catch (error) {
    console.log(error) 
  }
}

const exportLeadsToCSV = async () => {
  try {
      const leads = await LeadChatbot.find({});
      const csv = parse(leads, {
          fields: ["idLead", "channel", "data", "fullName", "nome", "cognome", "email", "numeroTelefono", "last_interaction", "appointment_date", "conversation_summary", "assigned"]
      });
      fs.writeFileSync('./leadchatbot.csv', csv);
      console.log('File CSV scritto con successo!');
  } catch (error) {
      console.error('Errore durante l\'esportazione dei leads:', error);
  } finally {
      mongoose.connection.close();
  }
};

//exportLeadsToCSV()
app.post('/api/save-chatbot-unusual', saveLeadChatbotUnusual);
app.post('/api/save-chatbot-smc', saveLeadSMC);
app.post('/api/save-chatbot-luiss', saveLeadLuiss);
app.post('/api/save-chatbot-vantaggio', saveLeadVantaggio);
app.post('/api/save-chatbot-demo', saveLeadDemo);
app.post('/api/save-chatbot-life', saveLeadLifeGen);
app.post('/api/save-chatbot-mira', saveLeadMira);
app.post('/api/save-chatbot-sunlight', saveLeadSunlight);
app.post('/api/save-chatbot-videoanimate', saveLeadVideoAnimate);
app.post('/api/save-chatbot-smc-new', saveLeadSMCNew);
app.post('/api/save-chatbot-unusual-new', saveLeadUnusualNew);
app.post('/api/save-chatbot-luiss-new', saveLeadLuissNew);

app.post('/chatbolt/save-chatbolt-lead', saveChatboltLead)

app.post('/submit-comparacorsi-luiss', async (req, res) => {
const { Nome, Cognome, Email, utm_medium, utm_source, utm_campaign, utm_term } = req.body;
const Telefono = req.body['Telefono/Cellulare']
const master = req.body['Quale master ti interessa?']
if (!Nome || !Cognome || !Email || !Telefono || !master) {
  return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
}

try {
  const newLead = new Lead({
      data: new Date(),
      nome: Nome,
      cognome: Cognome,
      email: Email,
      numeroTelefono: Telefono,
      campagna: 'AI chatbot',
      esito: 'Da contattare',
      orientatori: null,
      utente: "6674220bc423baeeaa460161", //"662f767d3eda57d593f420fe", TEST ACCOUNT
      note: '',
      fatturato: '',
      utmCampaign: 'AI chatbot',
      utmSource: utm_source,
      utmContent: utm_medium,
      utmTerm: utm_term,
      utmAdgroup: utm_campaign,
      utmAdset: "",
      appDate: "",
      summary: "Interessato a Master",
      last_interaction: "",
      tag: "luiss",
      master: master,
  });

  const existingLead = await Lead.findOne({ email: Email });
  if (!existingLead) {
    await newLead.save();
    await appendToGoogleSheet(newLead);
    const ecpLeadTracking = {
      ecpId: '6674220bc423baeeaa460161',
      leads: newLead,
    };
    const response = await axios.post('https://whatsecp-lead-28c0b2052b12.herokuapp.com/webhook-lead-luiss', ecpLeadTracking);
    if (response.status === 200) {
        console.log('Chiamata al webhook riuscita.');
    } else {
        console.log('Errore durante la chiamata al webhook:', response.statusText);
    }
    res.status(201).json({ message: 'Lead salvato correttamente' });
  } else {
    if(Email !== ""){
      existingLead.email = Email;
    };
    existingLead.nome = Nome;
    existingLead.cognome = Cognome;
    existingLead.numeroTelefono = Telefono;
    existingLead.master = master; 
    await existingLead.save()
    await appendToGoogleSheet(existingLead);
    res.status(200).json({ message: 'Lead salvato correttamente' });
  }
} catch (error) {
  console.error('Errore nel salvataggio del lead:', error);
  res.status(500).json({ error: 'Errore interno del server' });
}
});
/*const runDailyJob = () => {
  authorize()
    .then(exportChatbot)
    .catch(console.error);
};*/

//cron.schedule('10 2 * * *', runDailyJob);
const redirect_uris=["http://localhost:8001","http://localhost:8000","https://server-chatbot-ai-production.up.railway.app", "http://localhost:5173"]
const scopes = ['https://www.googleapis.com/auth/calendar'];
const CLIENT_SECRET="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"
const CLIENT_ID="321609978941-3tddpomhn02meoudv8k0giqguka5v18m.apps.googleusercontent.com"
const REDIRECT_URI = "http://localhost:8001/oauth2callback";
const serviceAccountAuth = new google.auth.JWT({
  email: 'calendarleadsystem@leadsystem-comparacorsi.iam.gserviceaccount.com',
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'info@funnelconsulting.it'
});

const calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });
async function findEventByTitleAndDate(title, date) {
  try {
      const events = await calendar.events.list({
          calendarId: 'primary',
          timeMin: moment(date).startOf('day').toISOString(),
          timeMax: moment(date).endOf('day').toISOString(),
          q: title,
          singleEvents: true,
          orderBy: 'startTime',
      });

      const event = events.data.items.find(event => event.summary.includes(title));

      if (event) {
          return event.id;
      } else {
          console.log('Evento non trovato');
          return null;
      }
  } catch (error) {
      console.error('Errore durante la ricerca dell\'evento:', error);
  }
}

const port = process.env.PORT || 8001;
app.listen(port, () => console.log(`Server is running on port ${port}`));
