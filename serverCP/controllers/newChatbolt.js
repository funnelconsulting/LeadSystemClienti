const Lead = require("../models/lead");
const LeadChatbot = require("../models/leadChatbot");
const User = require("../models/user")
const cron = require('node-cron')
const axios = require('axios')
const moment = require('moment-timezone');
require("dotenv").config();

function isValidPhoneNumber(phoneNumber) {
    const phoneRegex = /^(?:\+?39)?(?:\d{10})$/;
    return phoneRegex.test(phoneNumber);
  }

exports.saveChatboltLead = async (req, res) => {
    try {
      const { numeroTelefono, appointment_date, conversation_summary, email, clientId, first_name, last_name, canale, leadId } = req.body;
  
      const user = await User.findById(clientId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const formatPhoneNumber = (phone) => phone.replace(/\s+/g, '');
  
      const phoneVariants = [
        formatPhoneNumber(numeroTelefono),
        formatPhoneNumber(numeroTelefono.replace(/^(\+39|39)/, '')),
        formatPhoneNumber(`+39${numeroTelefono}`),
      ];

      const existingLead = await Lead.findOne({
        numeroTelefono: { $in: phoneVariants },
        utente: user._id,
      });
  
      if (existingLead) {
        existingLead.appDate = appointment_date || '';
        existingLead.summary = conversation_summary || '';
        existingLead.nome = first_name;
        existingLead.cognome = last_name;
        if (email && email.trim() !== "") {
          existingLead.email = email;
        }
        await existingLead.save();
        res.status(200).json({ message: 'Lead updated successfully' });
      } else {
        const newLead = new Lead({
          numeroTelefono: formatPhoneNumber(numeroTelefono),
          appDate: appointment_date || '',
          summary: conversation_summary || '',
          email: email?.trim() !== "" ? email : '',
          nome: first_name,
          cognome: last_name,
          data: new Date(),
          campagna: 'AI chatbot',
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id, //"662f767d3eda57d593f420fe", TEST ACCOUNT
          note: '',
          fatturato: '',
          utmCampaign: 'AI chatbot',
          utmSource: canale || '',
          utmContent: canale || '',
          utmTerm: canale || '',
          utmAdgroup: canale || "",
          utmAdset: canale || "",
          idLeadChatic: leadId,
        });
        await newLead.save();
        res.status(201).json({ message: 'Lead created successfully' });
      }
  
    } catch (error) {
      console.error('Error processing lead sync:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };  