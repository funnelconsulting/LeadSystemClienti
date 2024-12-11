const express = require('express');
const {dailyCap} = require('../controllers/subs');
const User = require('../models/user');

const router = express.Router();

const {getLeadsFb, getLeadsManual, getAllLead, calculateFatturatoByUtente, calculateFatturatoByOrientatore, calculateFatturatoByOrientatoreUser, getLeadsManualWhatsapp, updateLeadRecall, getLeadsManualBase, getOtherLeads, getOrientatoreLeads, getOtherLeadsOri, getLeadsWithRecallAndAppDate} = require('../controllers/leads');
const { createOrientatore, deleteOrientatore, createLead, deleteLead, updateLead, getOrientatori, getLeadDeleted, updateOrientatore, deleteRecall } = require('../controllers/orientatore');
const { getAllLeadForCounter, LeadForMarketing } = require('../controllers/superAdmin');
const { modificaEsito, createEsito, deleteEsito, getEsiti } = require('../controllers/esiti');
const Lead = require('../models/lead');

router.post("/get-leads-fb", getLeadsFb);
router.post("/get-leads-manual", getLeadsManual);
router.post("/get-leads-manual-base", getLeadsManualBase);
router.post("/get-orientatore-lead-base", getOrientatoreLeads);
router.post("/get-other-leads", getOtherLeads);
router.post("/get-lead-calendar", getLeadsWithRecallAndAppDate)
router.post("/get-other-leads-ori", getOtherLeadsOri);
router.post("/get-lead-whatsapp", getLeadsManualWhatsapp);
router.post("/create-orientatore", createOrientatore);
router.delete("/delete-orientatore", deleteOrientatore);
router.post('/lead/create/:id', createLead);
router.delete("/delete-lead", deleteLead);
router.put('/lead/:userId/update/:id', updateLead);
router.get('/utenti/:id/orientatori', getOrientatori);
router.get('/getAllLeads-admin', getAllLead);
router.get('/calculateFatturatoByUtente', calculateFatturatoByUtente);
router.get('/calculateFatturatoByOrientatore', calculateFatturatoByOrientatore)
router.post('/calculateFatturatoByOrientatoreUser/:id', calculateFatturatoByOrientatoreUser);
router.get('/get-lead-deleted', getLeadDeleted);
router.put('/update-orientatore/:id', updateOrientatore);
router.post('/update-lead-recall', updateLeadRecall);
router.post('/delete-recall', deleteRecall);

router.get('/get-all-leads-for-counter', getAllLeadForCounter);

router.get('/leads-for-marketing', LeadForMarketing);

router.post('/modify-daily-cap', dailyCap);

// Nuovi route per gli esiti
router.post('/esiti/create', createEsito);
router.put('/esiti/:id', modificaEsito);
router.delete('/esiti/:id', deleteEsito);
router.get('/esiti/:userId', getEsiti);

router.post('/enable-notifications', async (req, res) => {
  try {
    const userId = req.body.userId; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.notificationsEnabled = true;
    if (req.body.subscription) {
      user.notificationSubscriptions.push(req.body.subscription);
    }
    await user.save();

    return res.status(200).json({ message: 'Notifiche abilitate per l\'utente', user });
  } catch (error) {
    console.error('Errore nell\'abilitazione delle notifiche:', error);
    res.status(500).json({ message: 'Si è verificato un errore' });
  }
});

router.post('/webhook/typeform', async (req, res) => {
  try {
      const { form_response } = req.body;
      //console.log(form_response);
      // Estrarre i dati necessari
      const name = form_response.answers.find(
          (answer) => answer?.field?.id === 'ILOWgwGOBjMl'
      )?.text;
      const surname = form_response.answers.find(
        (answer) => answer?.field?.id === 'X9nBJYUEqnNG'
      )?.text;
      const email = form_response.answers.find(
          (answer) => answer.type === 'email'
      )?.email;
      const phone = form_response.answers.find(
          (answer) => answer.type === 'phone_number'
      )?.phone_number;

      const answers = form_response.answers;

      // Estrarre le risposte di tipo 'choice'
      const choices = answers
        .filter(answer => answer.type === 'choice')
        .map(answer => ({
          choice: answer.choice.label,
          //question: answer.field // Assumendo che 'title' contenga la domanda
        }));

      console.log(choices);
      console.log(name, surname, email, phone)
      // Salvare la lead nel database
      const newLead = new Lead({
        data: new Date(),
        nome: name || '',
        cognome: surname || '',
        email: email || '',
        numeroTelefono: phone || '',
        utente: "66d175318a9d02febe47d4a9",
        campagna: 'Typeform',
        esito: 'Da contattare',
        orientatori: null,
        note: '',
        fatturato: '',
        utmCampaign: 'Typeform',
        utmSource: 'Typeform',
        utmContent: 'Typeform',
        utmTerm: 'Typeform',
        utmAdgroup: 'Typeform',
        utmAdset: 'Typeform',
        appDate: "",
        summary: "",
        last_interaction: "",
        idLeadChatic: '',
        tag: "salespark",
        linkChat: "",
      });
      await newLead.save();

      res.status(200).send('Lead salvata con successo');
  } catch (error) {
      console.error(error);
      res.status(500).send('Errore nel salvataggio della lead');
  }
});

module.exports = router;