const Lead = require("../models/lead");
const LeadChatbot = require("../models/leadChatbot");
const User = require("../models/user")
const cron = require('node-cron')
const axios = require('axios')
const moment = require('moment');

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