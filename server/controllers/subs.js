const User = require('../models/user');
const LeadFacebook = require('../models/leadFacebook');
const LeadWordpress = require("../models/leadWordpress");
const Lead = require('../models/lead');
var cron = require('node-cron');
const axios = require("axios");
const { sendEmailLeadArrivati } = require('../middlewares');
const { getSalesparkLead } = require('./Facebook');
const Orientatore = require('../models/orientatori');
const LastLeadUser = require('../models/lastLeadUser');
const { runExportSales } = require('./wordpress');

let lastUserReceivedLead = null;

const calculateAndAssignLeadsEveryDay = async () => {
  try {
    let leads = await LeadFacebook.find({ $or: [{ assigned: false }, { assigned: { $exists: false } }] }).limit(150);

    const totalLeads = leads.length;
    console.log('Iscrizioni:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead disponibile');
      return;
    }

    for (const leadWithoutUser of leads) {
      if (leadWithoutUser.assigned) {
        console.log(`Il lead ${leadWithoutUser?._id} è già stato assegnato.`);
        continue;
      }

      const userData = {
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        trattamento: "",
        città: '',
        utm_source: '',
        utm_medium: '',
        utm_term: '',
        utm_campaign: '',
      };

      for (const field of leadWithoutUser.fieldData) {
        if (field.name === "nome") {
          userData.first_name = field.values[0];
        } else if (field.name === "cognome") {
          userData.last_name = field.values[0];
        } else if (field.name === "e-mail") {
          userData.email = field.values[0];
        } else if (field.name === "numero_di_telefono") {
          userData.phone_number = field.values[0];
        } else if (field.name === "utm_source") {
          userData.utm_source = field.values[0];
        } else if (field.name === "utm_medium") {
          userData.utm_medium = field.values[0];
        } else if (field.name === "utm_term") {
          userData.utm_term = field.values[0];
        } else if (field.name === "utm_campaign") {
          userData.utm_campaign = field.values[0];
        }
      }

      const newLead = new Lead({
        data: new Date(),
        nome: userData.first_name,
        cognome: userData.last_name,
        email: userData.email,
        numeroTelefono: userData.phone_number,
        utente: "66d175318a9d02febe47d4a9",
        campagna: leadWithoutUser.name ? leadWithoutUser.name : '',
        esito: 'Da contattare',
        orientatori: null,
        note: '',
        fatturato: '',
        utmSource: userData.utm_source || '',
        utmContent: userData.utm_medium || '',
        utmAdset: leadWithoutUser.adsets ? leadWithoutUser.adsets : '',
        utmCampaign: userData.utm_campaign || '',
        utmTerm: userData.utm_term || '',
        utmAdgroup: leadWithoutUser.annunci ? leadWithoutUser.annunci : '',
        appDate: "",
        summary: "",
        last_interaction: "",
        idLeadChatic: '',
        tag: "salespark",
        linkChat: "",
      });

      try {
        await newLead.save();
        runExportSales(newLead)
        leadWithoutUser.assigned = true;
        await leadWithoutUser.save();

        console.log(`Assegnato il lead ${leadWithoutUser?._id}`);
      } catch (error) {
        console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
      }
    }

    console.log('Elaborazione dei lead completata');

  } catch (error) {
    console.log(error.message);
  }
};

//calculateAndAssignLeadsEveryDay()

const calculateAndAssignLeadsEveryDayWordpress = async () => {
  try {
    let users = await User.find({ $and: [
      { monthlyLeadCounter: { $gt: 0 } },
      { tag: "pegaso" }
    ] });
    let leads = await LeadWordpress.find({
      $or: [
        { assigned: false },
        { assigned: { $exists: false } },
      ],
      $and: [
        {campagna: 'comparatore' },
      ]
    });
    const totalLeads = leads.length;
    console.log('Iscrizioni Wordpress:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead Wordpress disponibile');
      return;
    }

    let userIndex = 0;

    while (leads.length > 0 && users.some(user => user.monthlyLeadCounter > 0)) {
      const user = users[userIndex];

      if (!user) {
        console.log('Tutti gli utenti hanno il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          userIndex++;
          continue;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user.nameECP} è insufficiente. Non vengono assegnati ulteriori lead.`);
        userIndex++;
        continue;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        if (leadWithoutUser.assigned == true) {
          console.log(`Il lead ${leadWithoutUser.nome} è già stato assegnato.`);
          continue;
        }

        const newLead = new Lead({
          data: new Date(),
          nome: leadWithoutUser.nome || '',
          cognome: leadWithoutUser.cognome || '',
          email: leadWithoutUser.email || '',
          numeroTelefono: leadWithoutUser.numeroTelefono || '',
          campagna: leadWithoutUser.campagna ? leadWithoutUser.campagna : '',
          corsoDiLaurea: leadWithoutUser.corsoDiLaurea || '',
          frequentiUni: leadWithoutUser.universita || false,
          lavoro: leadWithoutUser.lavoro || false,
          facolta: leadWithoutUser.facolta || "",
          oreStudio: leadWithoutUser.orario || "",
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id,
          università: leadWithoutUser.università || '',
          provincia: leadWithoutUser.provincia || '',
          note: '',
          fatturato: '',
          utmCampaign: leadWithoutUser.utmCampaign || '',
          utmSource: leadWithoutUser.utmSource || '',
          utmContent: leadWithoutUser.utmContent || '',
          utmTerm: leadWithoutUser.utmTerm || '',
          utmAdgroup: leadWithoutUser.utmAdgroup || "",
          utmAdset: leadWithoutUser.utmAdset || "",
          categories: leadWithoutUser.categories || "",
          enrollmentTime: leadWithoutUser.enrollmentTime || "",
          budget: leadWithoutUser.budget || "",
          tipologiaCorso: leadWithoutUser.tipologiaCorso || "",
          leva: leadWithoutUser.leva || "",
        });

        try {
          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          const leadsVerify = await Lead.find({});
          const existingLead = leadsVerify.find(
            (lead) =>
              lead.cognome === leadWithoutUser.cognome && lead.email === leadWithoutUser.email
          );

          if (!existingLead) {
            await newLead.save();
            console.log(`Assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`);
            user.monthlyLeadCounter -= 1;
            user.dailyLead += 1;
            await user.save();

            const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
            if (leadIndex !== -1) {
              leads.splice(leadIndex, 1);
            }
          } else {
            console.log(`Già assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`)
            continue;
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }

      userIndex++;
      if (userIndex >= users.length) {
        userIndex = 0;
      }
    }

    if (totalLeads === 0) {
      console.log('LeadFacebook terminati prima che tutti gli utenti abbiano il contatore a 0');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const calculateAndAssignLeadsEveryDayWordpressComparatore = async () => {
  try {
    const userId = '655f707143a59f06d5d4dc3b';
    let user = await User.findById(userId);
    let leads = await LeadWordpress.find({
      $or: [
        { assigned: false },
        { assigned: { $exists: false } },
      ],
      $and: [
        { $or: [{ 'campagna': 'comparatore' }, { 'campagna': 'chatbot' }]}
      ]
    });

    const totalLeads = leads.length;
    console.log('Lead Comparatore:', totalLeads);

    if (totalLeads === 0) {
      console.log('Nessun lead Comparatore disponibile');
      return;
    }

    if (user.monthlyLeadCounter == 0){
      console.log('Utente ha il comparatore a 0');
      return;
    }

    while (leads.length > 0 && user.monthlyLeadCounter > 0) {

      if (!user) {
        console.log('Utente ha il contatore a 0');
        break;
      }

      if (user.dailyCap !== undefined && user.dailyCap !== null) {
    
        if (user.dailyLead >= user.dailyCap) {
          console.log(`L'utente ${user.nameECP} ha raggiunto il dailyCap per oggi.`);
          break;
        }
      }

      const leadsNeeded = Math.min(user.monthlyLeadCounter, 1);

      if (leadsNeeded === 0) {
        console.log(`Il contatore mensile dell'utente ${user.nameECP} è insufficiente. Non vengono assegnati ulteriori lead.`);
        break;
      }

      const leadsForUser = leads.splice(0, leadsNeeded);

      for (const leadWithoutUser of leadsForUser) {
        if (leadWithoutUser.assigned == true) {
          console.log(`Il lead ${leadWithoutUser.nome} è già stato assegnato.`);
          continue;
        }

        const newLead = new Lead({
          data: new Date(),
          nome: leadWithoutUser.nome || '',
          cognome: leadWithoutUser.cognome || '',
          email: leadWithoutUser.email || '',
          numeroTelefono: leadWithoutUser.numeroTelefono || '',
          campagna: leadWithoutUser.campagna ? leadWithoutUser.campagna : '',
          corsoDiLaurea: leadWithoutUser.corsoDiLaurea || '',
          frequentiUni: leadWithoutUser.universita || false,
          lavoro: leadWithoutUser.lavoro || false,
          facolta: leadWithoutUser.facolta || "",
          oreStudio: leadWithoutUser.orario || "",
          esito: 'Da contattare',
          orientatori: null,
          utente: user._id,
          università: leadWithoutUser.università || '',
          provincia: leadWithoutUser.provincia || '',
          note: '',
          fatturato: '',
          utmCampaign: leadWithoutUser.utmCampaign || '',
          utmSource: leadWithoutUser.utmSource || '',
          utmContent: leadWithoutUser.utmContent || '',
          utmTerm: leadWithoutUser.utmTerm || '',
          utmAdgroup: leadWithoutUser.utmAdgroup || "",
          utmAdset: leadWithoutUser.utmAdset || "",
          categories: leadWithoutUser.categories || "",
          enrollmentTime: leadWithoutUser.enrollmentTime || "",
          budget: leadWithoutUser.budget || "",
          tipologiaCorso: leadWithoutUser.tipologiaCorso || "",
          leva: leadWithoutUser.leva || "",
        });

        try {
          leadWithoutUser.assigned = true;
          await leadWithoutUser.save();

          const leadsVerify = await Lead.find({});
          const existingLead = leadsVerify.find(
            (lead) =>
              lead.cognome === leadWithoutUser.cognome && lead.email === leadWithoutUser.email
          );

          if (!existingLead) {
            await newLead.save();
            console.log(`Assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`);
            user.monthlyLeadCounter -= 1;
            user.dailyLead += 1;
            await user.save();

            const leadIndex = leads.findIndex(lead => lead._id.toString() === leadWithoutUser._id.toString());
            if (leadIndex !== -1) {
              leads.splice(leadIndex, 1);
            }
          } else {
            console.log(`Già assegnato il lead ${leadWithoutUser.cognome} all'utente con ID ${user.nameECP}`)
            continue;
          }

        } catch (error) {
          console.log(`Errore nella validazione o salvataggio del lead: ${error.message}`);
        }
      }
    }

    if (totalLeads === 0) {
      console.log('Lead Comparatore terminati prima che utente abbia il contatore a 0');
    }

  } catch (error) {
    console.log(error.message);
  }
};

const resetDailyCap = async () => {
  console.log('Eseguo il reset del cap');

  try {
    const users = await User.find();

    for (const user of users) {
      user.dailyLead = 0;
      await user.save();
    }

    console.log('Cap giornaliero resettato');
  } catch (err) {
    console.log(err);
  }
};

/*cron.schedule('07,20,35,50 8,9,10,11,12,13,14,15,16,17 * * *', () => {
  calculateAndAssignLeadsEveryDayTag();
  console.log('Eseguo calculate Lead Tag di prova');
});*/


/*cron.schedule('30 6 * * *', () => {
  resetDailyCap();
  console.log('Eseguito il reset del daily Lead');
});*/

/*
cron.schedule('20,56,30 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  getDentistaLead2();
  console.log('Prendo i lead di Bluedental 3.0');
});

cron.schedule('5,36,15 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  getDentistaLead3();
  console.log('Prendo i lead di Bluedental 3.0');
});

*/

cron.schedule('8,49,18 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  getSalesparkLead();
  console.log('Prendo i lead di salespark da meta');
});

cron.schedule('15,58,25,40 8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  calculateAndAssignLeadsEveryDay();
  console.log('Assegno i lead di salespark');
});

/*
cron.schedule('47 7,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23 * * *', () => {
  console.log('Eseguo l\'assegnazione a Ecp solo comparatore');
  calculateAndAssignLeadsEveryDayWordpressComparatore();
});*/
async function updateAssignedField() {
  try {
      await LeadFacebook.updateMany({}, { assigned: true });
      console.log('Campo "assigned" aggiornato per tutte le lead.');
  } catch (error) {
      console.error('Errore durante l\'aggiornamento del campo "assigned" delle lead:', error);
  }
}
async function countFL(){
  try {
    const lead = await LeadFacebook.find();
    console.log(lead.length)
  } catch (error) {
    console.error(error)
  }
}
//countFL()
//getBludentalLead();
//updateAssignedField();
//calculateAndAssignLeadsEveryDay();

exports.dailyCap = async (req, res) => {
  try {
    const userId = req.body.userId;
    const dailyCap = req.body.dailyCap;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.dailyCap = dailyCap;

    await user.save();

    res.status(200).json({ message: 'Daily cap aggiornato con successo', user });  
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del daily cap' });
  }
};

async function updateLeads() {
  try {
      const leadsToUpdate = await Lead.find({ esito: "Da contattare", orientatori: { $ne: '660fc6b59408391f561edc1a' } });
      const excludedOrientatoreIds = ['660fc6b59408391f561edc1a', '65ddbe8676b468245d701bc2'];

      let orientatori = await Orientatore.find({ _id: { $nin: excludedOrientatoreIds }});
      const numLeads = leadsToUpdate.length;
      const numOrientatori = orientatori.length;
    console.log(numLeads);

    const numLeadsPerOrientatore = Math.ceil(numLeads / numOrientatori);

    let startIndex = 0;
    for (const orientatore of orientatori) {
      const endIndex = Math.min(startIndex + numLeadsPerOrientatore, numLeads);
      const leadsToAssign = leadsToUpdate.slice(startIndex, endIndex);

      for (const lead of leadsToAssign) {
        lead.orientatori = orientatore._id; // Assegna l'ID dell'orientatore alla lead
        await lead.save();
      }

      startIndex = endIndex;
    }

      console.log(`Aggiornamento completato. lead sono stati aggiornati.`);
  } catch (error) {
      console.error('Si è verificato un errore durante l\'aggiornamento dei lead:', error);
  }
}
async function updateLeadsRec() {
  const startDate = new Date('2024-03-24T00:00:00.000Z');
  const endDate = new Date('2024-03-30T23:59:59.999Z');
  try {
    const excludedOrientatoreId = '660fc6b59408391f561edc1a';
      const leadsToUpdate = await Lead.find({ esito: "Da contattare" });
      const filteredLeads = leadsToUpdate.filter((lead) => {
        //const leadDate = new Date(lead.data);
        return (
          //leadDate >= startDate &&
          //leadDate <= endDate
          Number(lead.tentativiChiamata) > 0
        );
      });
      const orientatori = await Orientatore.findById(excludedOrientatoreId);
      const numLeads = filteredLeads.length;
    console.log(numLeads);

      for (const lead of filteredLeads) {
        lead.orientatori = orientatori._id;
        await lead.save();
      }

      console.log(`Aggiornamento completato. lead sono stati aggiornati.`);
  } catch (error) {
      console.error('Si è verificato un errore durante l\'aggiornamento dei lead:', error);
  }
}

async function updateLeadsEsito() {
  try {
    const excludedOrientatoreIds = ['660fc6b59408391f561edc1a', '65ddbe8676b468245d701bc2'];
    let orientatori = await Orientatore.find({ _id: { $nin: excludedOrientatoreIds }}); 
      const leadsToUpdate = await Lead.find({orientatori: "6613a1389408391f56215308"});

      const filteredLeads = leadsToUpdate.filter((lead) => {
        return (
          lead.esito === "Da contattare"
        );
      });
      const numLeads = filteredLeads.length;
    console.log(numLeads);

      for (const lead of filteredLeads) {
        lead.orientatori = "660fc6b59408391f561edc1a";
        await lead.save();
      }

      console.log(`Aggiornamento completato. lead sono stati aggiornati.`);
  } catch (error) {
      console.error('Si è verificato un errore durante l\'aggiornamento dei lead:', error);
  }
}

async function deleteLeadsGold() {
  try {
      await Lead.deleteMany({ utmCampaign: { $regex: /ambra/i } });
      const count = await Lead.countDocuments({ utmCampaign: { $regex: /gold/i } });
      console.log("Numero di lead con utmCampaign 'gold':", count);
      console.log(`Aggiornamento completato. lead sono stati aggiornati.`);
  } catch (error) {
      console.error('Si è verificato un errore durante l\'aggiornamento dei lead:', error);
  }
}
async function updateLeadsByPhoneNumber(phoneNumbers) {
  for (const telefono of phoneNumbers) {
      const lead = await Lead.findOne({ numeroTelefono: telefono });
      if (lead) {
          console.log('Lead trovata per il numero di telefono:', telefono);
          lead.orientatori = '660fc6b59408391f561edc1a';
          await lead.save();
          console.log('Campo orientatori aggiornato per la lead con numero di telefono:', telefono);
      } else {
          console.log('Lead non trovata per il numero di telefono:', telefono);
      }
  }
}

//updateLeadsByPhoneNumber(phoneNumbers)
//deleteLeadsGold()
//updateLeads();
//updateLeadsEsito();
//updateLeadsRec(); //DEI NON RISPONDE OGNI INIZIO SETTIMANA

const processTrigger = async () => {
  const userId = '662f767d3eda57d593f420fe';
  //const url = `http://localhost:9000/ls/process-trigger/${userId}`;
  const url = `https://chatbolt-comparacorsi-production.up.railway.app/ls/process-trigger/${userId}`;

  const lead = await Lead.findOne({numeroTelefono: "393382857716"})
  const payload = {
    action: '1',
    userInfo: {
      _id: lead._id,
      first_name: lead.nome,
      last_name: lead.cognome,
      email: lead.email,
      numeroTelefono: lead.numeroTelefono,
    }
  };

  try {
    const response = await axios.post(url, payload);
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error processing trigger:', error.response ? error.response.data : error.message);
  }
};

//processTrigger()