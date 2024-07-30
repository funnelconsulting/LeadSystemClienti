const Lead = require("../models/lead");
const LeadChatbot = require("../models/leadChatbot");
const User = require("../models/user")
const cron = require('node-cron')
const axios = require('axios')
const moment = require('moment-timezone');
const { google } = require('googleapis');
const { appendToGoogleSheet } = require("./exportSheet");
require("dotenv").config();
/*
{
  "type": "service_account",
  "project_id": "leadsystem-calendar",
  "private_key_id": "bf75055c7f23311636998eb8fd98ecc3bf790c98",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEAwZt1ngBwN+m\nocMrAgXFrLBOlwov4SD6SiMuxA4coSrMgj5PFEqnaJuppuPikL70EIqbNO7TBtBt\n/3EfnRBGzFpRrukKAdUG1cKQ5MfRX9Q62g+3nxyJl7AvP8DH3u30ZtPZ58TBG6JS\nmK7DlQf5gB+zGFK6LW9gvhOxU6q5qZ4SovaEfcqcxm2Lfw0arsI3d0IQIHftObBL\nCeALGAL/TFm6ofxgg+4Tf33TPjM+WRadZZD0Bdc1vf2lUvDKoyEbhK/PgPhu9f1r\n7F+OEUOVmH5aYgeaJiZUk5ubf/AlBMCoc46ajIwJGEyLPBlggLjMdh/iHjXn9DEP\nUfAVna3xAgMBAAECggEAAQrqE6lsSH72L075wa/GCCh45Jz72bW00qpLOEJI7sn7\nZOgGBgopjn9XDzRbPHccJFlImuQ/S/iRalTx+sdkNYXqHFzoJFyp6yy110ZlaLSG\n9951brrdC/YtNNlrpQ/1DAFfl1Qa44DKKcnP6ZnHKdTX0cCZMOmMvpU+ihJ4d9XZ\nEjdRqny3AGsaj8rwAJohMzye2fu5J+XJX/6ybW2n+VyASoEXWogC5hYAmDILqdKw\nyBHPocuAJbvL1D4zZSjgnlnR0Sxq+AjZjxgjAFVYt77ThCw8pbIc0wHaHO3VgliM\n8d6olnn4VdPVTGBJ0aYAolRcxyQytX4K66wab+81xQKBgQDy6MWjV52DsBHIZQ6z\nmtV1sIv3jLDFf5+fLDpKchOFdMrACMiqf+A7XI6KaQ3I/2i3PD6Tr76CBWXOlliz\nxWbZL12ohqTGgr+JeEWTX+QsItB/qbxelixPCuQifW0QluYenA/riXQc5YMWabJ3\n/4+U02378Zo8WY8AIoyMh3bHzQKBgQDOkz7y9dW3QtyukBt5BW4SUqZNWS61q5DK\nzy+UPy6GZJMCDBpqDB4maIsO6aCV+9ple6A4EW6wathwfevX4y0uBr1KKwZrqBqI\nB7PXPmrYLJeZCRuabi/1XFWcQ8zyC0hbMIhVT14tqw1DnYAmf/6Y4lkg665jekcy\n+FiFBO4StQKBgA0e7a4JCYUXeZ5tdwHUlzsoMidI/jNs1V5vsSZcSxmmWV1OHCi5\nh48tTLXFPu1gfnOHWYn4sD2ttPYXwOrU+t04ZcK4oyXl4hq22GtBfr2zk7eRn48s\nZXBPkksao02GGSAGJgX/Arqc2xvW0cERmNvdH8/AGSixXbwQIa9lkdDxAoGAVW7Q\nOesx1/jvC8LNmd+FBk7oOFUJ3Fh4KWhGZSk8NJijs9UNl44rafcSi7hTkbP3PsFC\nIe4TuSJ3IQ7y2vY5WS+wWVwx65Q6ZMfKuNo3le/bQo9huxyW+QKW5Wmk+PVxl0Ub\nHS0V5g04Dx60QTfuM4xpEBRoqvuHNq0+7sR7MYECgYBJ/uxpGzVCpDxvwJQBS5wX\nlWdYaZmGkvXAfTqJHLg1lrAbcxJCwnTUMDwUMIiZlJCMni0PJ/WKHTksM5AJ8xbF\n6t1zwdOMVBVIet5UCA5SQqmUR9sB+bYVqM+GUDH4JxnGDhHAYnkOzBEtcZ2Zk/f/\nUISIJCXh3SEWNW7P+6x/IA==\n-----END PRIVATE KEY-----\n",
  "client_email": "calendar@leadsystem-calendar.iam.gserviceaccount.com",
  "client_id": "101383022317471814766",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/calendar%40leadsystem-calendar.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
*/
const scopes = ['https://www.googleapis.com/auth/calendar'];
const redirect_uris = ["https://leadsystem-production.up.railway.app/","http://localhost:8000/","https://server-chatbot-ai-production.up.railway.app/","http://localhost:8001/"]
const key = process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n');

const serviceAccountAuth = new google.auth.JWT({
  email: 'calendar@leadsystem-calendar.iam.gserviceaccount.com',
  key: key,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'marketing@funnelconsulting.it'
});

const calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });
async function createEvent(emailInvitato, dataInizio, nome, summary, phoneNumber, email){
  const formattedDate = moment(dataInizio, 'YY-MM-DD HH:mm').format('DD-MM-YY HH:mm');
  const dateTimeISO = moment.tz(formattedDate, 'DD-MM-YY HH:mm', 'Europe/Rome').toISOString();
  const endDateTimeISO = moment.tz(formattedDate, 'DD-MM-YY HH:mm', 'Europe/Rome').add(30, 'minutes').toISOString();
  let descriptionTot = `Summary: ${summary}\nNome: ${nome}\nCellulare: ${phoneNumber}`;
  if (email) {
      descriptionTot += `\nEmail: ${email}`;
  }
  const event = {
      summary: 'Appuntamento con '+nome,
      description: descriptionTot,
      start: {
        dateTime: dateTimeISO,
        timeZone: 'Europe/Rome',
      },
      end: {
          dateTime: endDateTimeISO,
          timeZone: 'Europe/Rome',
      },
      attendees: [
          { email: 'marketing@funnelconsulting.it' },
          //{ email: "andrea.c@funnelconsulting.it"},
          { email: "info@funnelconsulting.it"},
          { email: emailInvitato },
          //{ email: "mattianoris23@gmail.com"}
      ],
      reminders: {
          useDefault: false,
          overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
          ],
      },
  };

  try {
      const { data } = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          sendUpdates: 'all'
      });

      console.log(`Evento creato: ${data.htmlLink}`);
  } catch (error) {
      console.error('Errore nella creazione dell\'evento:', error);
  }
}

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^(?:\+?39)?(?:\d{10})$/;
    return phoneRegex.test(phoneNumber);
  }

exports.saveLeadChatbotUnusual = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let cognome = '';
    let nome = '';
    const specificField = custom_fields.find(field => field.id === '759444');
    const specificFieldApp = custom_fields.find(field => field.id === '31128');
    const customLastSurname = custom_fields.find(field => field.id === "500371");
    const customLastName = custom_fields.find(field => field.id === "940350");
    if (specificField && specificField.type === '0') {
      conversation_summary = specificField.value;
    }
    if (customLastName && customLastName.value !== '') {
      nome = customLastName.value;
    }
    if (customLastSurname && customLastSurname.value !== '') {
      cognome = customLastSurname.value;
    }
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = nome && nome !== '' ? nome : first_name;
      lead.cognome = cognome && cognome !== '' ? cognome : last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (conversation_summary && specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId = '6634e06f353945e674c43b70'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "6634e06f353945e674c43b70", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "unusual",
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Unusual`);
            await user.save();
            await createEvent("info@unusualexperience.it", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Unusual`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name; 
            await existingLead.save()
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: nome && nome !== '' ? nome : first_name,
        cognome: cognome && cognome !== '' ? cognome : last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "unusual",
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (conversation_summary && specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId ='6634e06f353945e674c43b70'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "6634e06f353945e674c43b70", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "unusual",
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Unusual`);
            await user.save();
            await createEvent("info@unusualexperience.it", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Unusual`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name; 
            await existingLead.save()
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};

exports.saveLeadSMC = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let cognome = '';
    let nome = '';
    const specificField = custom_fields.find(field => field.id === '500329');
    const specificFieldApp = custom_fields.find(field => field.id === '934190');
    const customLastSurname = custom_fields.find(field => field.id === "652840");
    const customLastName = custom_fields.find(field => field.id === "242329");
    if (specificField && specificField.type === '0') {
      conversation_summary = specificField.value;
    }
    if (customLastName && customLastName.value !== '') {
      nome = customLastName.value;
    }
    if (customLastSurname && customLastSurname.value !== '') {
      cognome = customLastSurname.value;
    }
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = nome && nome !== '' ? nome : first_name;
      lead.cognome = cognome && cognome !== '' ? cognome : last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (conversation_summary && specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId = '665d947ba3d5d27812733530'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "665d947ba3d5d27812733530", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "smc",
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name; 
            await existingLead.save()
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: nome && nome !== '' ? nome : first_name,
        cognome: cognome && cognome !== '' ? cognome : last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "smc",
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (conversation_summary && specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId ='665d947ba3d5d27812733530'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "665d947ba3d5d27812733530", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "smc",
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name; 
            await existingLead.save()
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};


exports.saveLeadLuiss = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let cognome = '';
    let nome = '';
    let master = '';
    const specificField = custom_fields.find(field => field.id === '720286');
    const specificFieldApp = custom_fields.find(field => field.id === '562190');
    const customLastSurname = custom_fields.find(field => field.id === "26189");
    const customLastName = custom_fields.find(field => field.id === "246801");
    const customMaster = custom_fields.find(field => field.id === "905554");
    if (customMaster && customMaster.value !== ""){
      master = customMaster.value;
    }
    if (specificField && specificField.type === '0') {
      conversation_summary = specificField.value;
    }
    if (customLastName && customLastName.value !== '') {
      nome = customLastName.value;
    }
    if (customLastSurname && customLastSurname.value !== '') {
      cognome = customLastSurname.value;
    }
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = nome && nome !== '' ? nome : first_name;
      lead.cognome = cognome && cognome !== '' ? cognome : last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;
      lead.master = master;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (nome){
        const userId = '6674220bc423baeeaa460161'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "6674220bc423baeeaa460161", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "luiss",
          master: master,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Luiss`);
            await user.save();
            await appendToGoogleSheet(newLead);
            const ecpLeadTracking = {
              ecpId: user._id,
              leads: newLead,
            };
            const response = await axios.post('https://whatsecp-lead-28c0b2052b12.herokuapp.com/webhook-lead-luiss', ecpLeadTracking);
            if (response.status === 200) {
                console.log('Chiamata al webhook riuscita.');
            } else {
                console.log('Errore durante la chiamata al webhook:', response.statusText);
            }
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Luiss`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name;
            existingLead.master = master; 
            await existingLead.save()
            await appendToGoogleSheet(existingLead);
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: nome && nome !== '' ? nome : first_name,
        cognome: cognome && cognome !== '' ? cognome : last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "luiss",
        master: master,
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (nome){
        const userId ='6674220bc423baeeaa460161'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: nome && nome !== '' ? nome : first_name,
          cognome: cognome && cognome !== '' ? cognome : last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "6674220bc423baeeaa460161", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "luiss",
          master: master,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Luiss`);
            await user.save();
            await appendToGoogleSheet(newLead);
            const ecpLeadTracking = {
              ecpId: user._id,
              leads: newLead,
            };
            const response = await axios.post('https://whatsecp-lead-28c0b2052b12.herokuapp.com/webhook-lead-luiss', ecpLeadTracking);
            if (response.status === 200) {
                console.log('Chiamata al webhook riuscita.');
            } else {
                console.log('Errore durante la chiamata al webhook:', response.statusText);
            }
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Luiss`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = nome && nome !== '' ? nome : first_name;
            existingLead.cognome = cognome && cognome !== "" ? cognome : last_name;
            existingLead.master = master; 
            await existingLead.save()
            await appendToGoogleSheet(existingLead);
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};

exports.saveLeadDemo = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let linkChat = '';
    //const specificField = custom_fields.find(field => field.id === '500329');
    const specificFieldApp = custom_fields.find(field => field.id === '940106');
    const linkChatField = custom_fields.find(field => field.id === "940935");
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    if (linkChatField && linkChatField.value){
      linkChat = linkChatField.value
    }


    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = first_name;
      lead.cognome = last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;
      lead.linkChat = linkChat;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId = '662f767d3eda57d593f420fe'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "662f767d3eda57d593f420fe", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "smc",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: first_name,
        cognome: last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "smc",
        linkChat: linkChat,
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId ='662f767d3eda57d593f420fe'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "662f767d3eda57d593f420fe", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "smc",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};

exports.saveLeadLifeGen = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let linkChat = '';
    //const specificField = custom_fields.find(field => field.id === '500329');
    const specificFieldApp = custom_fields.find(field => field.id === '940106');
    const linkChatField = custom_fields.find(field => field.id === "528718");
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    if (linkChatField && linkChatField.value){
      linkChat = linkChatField.value
    }


    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = first_name;
      lead.cognome = last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;
      lead.linkChat = linkChat;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId = '66a8eabc6153b4378acf1ccc'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "66a8eabc6153b4378acf1ccc", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "life-generation",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: first_name,
        cognome: last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "life-generation",
        linkChat: linkChat,
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (first_name.trim() !== "" && last_name.trim() !== "" && email.trim() !== "" && phone.trim() !== ""){
        const userId ='66a8eabc6153b4378acf1ccc'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "66a8eabc6153b4378acf1ccc", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "life-generation",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};

exports.saveLeadVantaggio = async (req, res) => {
  console.log(req.body);
  try {
    const {
      id,
      channel,
      full_name,
      first_name,
      last_name,
      email,
      phone,
      last_interaction,
      custom_fields
    } = req.body;

    let conversation_summary = '';
    let canale = '';
    let linkChat = '';
    //const specificField = custom_fields.find(field => field.id === '500329');
    const specificFieldApp = custom_fields.find(field => field.id === '940106');
    const linkChatField = custom_fields.find(field => field.id === "554346");
    const date = new Date(parseInt(last_interaction));
    const formattedDate = date.toLocaleString();

    if (linkChatField && linkChatField.value){
      linkChat = linkChatField.value
    }

    let lead = await LeadChatbot.findOne({ idLead: id });
    if(channel === "5"){
      canale = "Whatsapp"
    }else if (channel === "0"){
      canale = "Messenger"
    }else if (channel === "8"){
      canale = "Telegram"
    }else {
      canale = "Nessuno"
    }

 if (lead) {
      lead.channel = canale;
      lead.fullName = full_name;
      lead.nome = first_name;
      lead.cognome = last_name;
      lead.email = email;
      lead.numeroTelefono = phone;
      lead.last_interaction = formattedDate;
      lead.conversation_summary = conversation_summary;
      lead.appointment_date = specificFieldApp.value;
      lead.linkChat = linkChat;

      await lead.save();
      console.log('Lead aggiornata con successo nel database!');
      if (specificFieldApp?.value && specificFieldApp?.value !== ""){
        const userId = '668ea5070f7da9d0a780398e'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "668ea5070f7da9d0a780398e", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "vantaggio",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              console.log('Numero non valido')
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
            console.log('Lead aggiornato')
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    } else {
      lead = new LeadChatbot({
        data: new Date(),
        idLead: id,
        channel: canale,
        fullName: full_name,
        nome: first_name,
        cognome: last_name,
        email: email,
        numeroTelefono: phone,
        last_interaction: formattedDate,
        conversation_summary: conversation_summary,
        appointment_date: specificFieldApp.value,
        tag: "vantaggio",
        linkChat: linkChat,
      });

      await lead.save();
      console.log('Lead salvato con successo nel database!');
      if (first_name.trim() !== "" && last_name.trim() !== "" && email.trim() !== "" && phone.trim() !== ""){
        const userId ='668ea5070f7da9d0a780398e'; //'662f767d3eda57d593f420fe'; TEST ACCOUNT
        let user = await User.findById(userId);
        const newLead = new Lead({
          data: new Date(),
          nome: first_name,
          cognome: last_name,
          email: email || '',
          numeroTelefono: phone || '',
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: "668ea5070f7da9d0a780398e", //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          appDate: specificFieldApp.value || "",
          summary: conversation_summary || "",
          last_interaction: formattedDate || "",
          idLeadChatic: id,
          tag: "vantaggio",
          linkChat: linkChat,
        });
        try {

          const existingLead = await Lead.findOne({ idLeadChatic: id });

          if (!existingLead) {
            if (!isValidPhoneNumber(phone)){
              console.log("Numero non valido")
              return
            }
            lead.assigned = true;
            await lead.save();
            await newLead.save();
            console.log(`Assegnato il lead ${lead.cognome} all'utente Smc`);
            await user.save();
            //await createEvent("smc@scuolamotociclismo.com", newLead.appDate, nome + ' ' + cognome, conversation_summary, phone, email)
          } else {
            console.log(`Già assegnato il lead ${lead.cognome} all'utente Smc`)
            if (!isValidPhoneNumber(phone)){
              return
            }
            if(email !== ""){
              existingLead.email = email;
            };
            existingLead.summary = conversation_summary;
            existingLead.appDate = specificFieldApp.value;
            existingLead.numeroTelefono = phone;
            existingLead.nome = first_name;
            existingLead.cognome = last_name; 
            await existingLead.save()
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    res.status(200).json({ message: 'Successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error, message: 'Errore' });
  }
};

const provaWebhookwhatsapp = async () => {
  try {
    const newLead = {
      nome: "Mattia",
      cognome: "Noris",
      numeroTelefono: '3313869850',
    };
    const ecpLeadTracking = {
      ecpId: "6674220bc423baeeaa460161",
      leads: newLead,
    };
    const response = await axios.post('https://whatsecp-lead-28c0b2052b12.herokuapp.com/webhook-lead-luiss', ecpLeadTracking);
            if (response.status === 200) {
                console.log('Chiamata al webhook riuscita.');
            } else {
                console.log('Errore durante la chiamata al webhook:', response.statusText);
            }
  } catch (error) {
    console.error(error)
  }
}

//createEvent("andrea.c@funnelconsulting.it", "24-05-29 18:00", "Mattia Noris", "Il cliente vuole prenotare", "3313869850", "mattianoris23@gmail.com")