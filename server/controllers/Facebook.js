const LeadFacebook = require('../models/leadFacebook');
const showDebugingInfo = true; 
'use strict';
const cron = require('node-cron');
const axios = require('axios');

const accessToken = 'EAALrI8XoapEBO2rlxJs4ndjJmY2NShPE3ZB4EYojTjMZCUxKr6XuNOfS2vTskYMMpDR1ai8StjxggcOJZAeiAFnOgJyuW6yho3ouqRebO7XPmADiMtLVZCwexv3rd2GyjuLho5XyhxbGdZC5Ag2hJEbhtQQPhfyOqfhYZBLlZBL4ZBWAmMpZBGYZBGEJM6';
const apiUrl = 'https://graph.facebook.com/v12.0';
const idCampagna = '23858081191190152'; //ECP [LEAD ADS] - LAL Vendite - vantaggi VIDEO
const idCampagna2 = '23859089103880152'; //ECP - [LEAD ADS] - Master
const fields = 'id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}';

//LEADS 
const TOKENBLUDENTAL = "EAALrI8XoapEBO2rlxJs4ndjJmY2NShPE3ZB4EYojTjMZCUxKr6XuNOfS2vTskYMMpDR1ai8StjxggcOJZAeiAFnOgJyuW6yho3ouqRebO7XPmADiMtLVZCwexv3rd2GyjuLho5XyhxbGdZC5Ag2hJEbhtQQPhfyOqfhYZBLlZBL4ZBWAmMpZBGYZBGEJM6";
const TOKENMIO = "EAALrI8XoapEBO2rlxJs4ndjJmY2NShPE3ZB4EYojTjMZCUxKr6XuNOfS2vTskYMMpDR1ai8StjxggcOJZAeiAFnOgJyuW6yho3ouqRebO7XPmADiMtLVZCwexv3rd2GyjuLho5XyhxbGdZC5Ag2hJEbhtQQPhfyOqfhYZBLlZBL4ZBWAmMpZBGYZBGEJM6";
const TOKEN1 = "EAALrI8XoapEBO2rlxJs4ndjJmY2NShPE3ZB4EYojTjMZCUxKr6XuNOfS2vTskYMMpDR1ai8StjxggcOJZAeiAFnOgJyuW6yho3ouqRebO7XPmADiMtLVZCwexv3rd2GyjuLho5XyhxbGdZC5Ag2hJEbhtQQPhfyOqfhYZBLlZBL4ZBWAmMpZBGYZBGEJM6";
const { GoogleAdsApi, enums  } = require('google-ads-api');
const Lead = require('../models/lead');

 const saveLeadFromFacebookAndInstagram = async (logs) => {
  const leads = logs;

  if (Array.isArray(leads)) {
    const formattedLeads = leads.map((lead) => {
      return {
        formId: lead.formId,
        fieldData: Array.isArray(lead.fieldData)
          ? lead.fieldData.map((data) => {
              return {
                name: data.name,
                values: data.values,
              };
            })
          : [],
        id: lead.id ? lead.id : '',
        data: new Date(),
        annunci: lead.annunci ? lead.annunci : '',
        adsets: lead.adsets ? lead.adsets : '',
        name: lead.name ? lead.name : '',
      };
    });

    const existingLeads = await LeadFacebook.find({ id: { $in: formattedLeads.map((lead) => lead.id) } });

    const newLeads = formattedLeads.filter((lead) => {
      return !existingLeads.some((existingLead) => existingLead.id === lead.id);
    });

    // Salva i nuovi lead nel database
    if (newLeads.length > 0) {
      LeadFacebook.insertMany(newLeads)
        .then(() => {
          console.log('Dati dei lead Bluedental salvati nel database', newLeads);
        })
        .catch((error) => {
          console.error('Errore nel salvataggio dei lead Bluedental nel database:', error);
        });
    } else {
      console.log('Nessun nuovo lead Bluedental da salvare nel database');
    }
  } else {
    console.log('Dati Lead Bluedental non validi');
  }
};

  const saveLeadFromFacebookAndInstagramTag = async (response, campagnaId) => {
    if (!response.leads || !response.leads.data) {
      console.log('response.leads.data è undefined o null');
      return;
  }
    const leads = response.leads.data;
  
    if (Array.isArray(leads)) {
      const formattedLeads = leads.map((lead) => {
        return {
          formId: lead.formId,
          fieldData: Array.isArray(lead.field_data)
            ? lead.field_data.map((data) => {
                return {
                  name: data.name,
                  values: data.values,
                };
              })
            : [],
          id: lead.id,
          data: new Date(),
          annunci: lead.annunci ? lead.annunci : '',
          adsets: lead.adsets ? lead.adsets : '',
          name: lead.name ? lead.name : '',
        };
      });
  
      const existingLeads = await Lead.find({ id: { $in: formattedLeads.map((lead) => lead.id) } });
  
      const newLeads = formattedLeads.filter((lead) => {
        return !existingLeads.some((existingLead) => existingLead.id === lead.id);
      });
  
      // Salva i nuovi lead nel database
      if (newLeads.length > 0) {
        Lead.insertMany(newLeads)
          .then(() => {
            console.log('Dati dei lead TAG salvati nel database', newLeads);
          })
          .catch((error) => {
            console.error('Errore nel salvataggio dei lead TAG nel database:', error);
          });
      } else {
        console.log('Nessun nuovo lead TAG da salvare nel database');
      }
    } else {
      console.log('Dati dei lead TAG non validi');
    }
  };

  exports.getTagLeads = () => {
    axios
      .get(`${apiUrl}/${idCampagna}`, {
        params: {
          fields,
          access_token: accessToken,
        },
      })
      .then((response) => {
        response.data.ads.data.forEach((ad) => {
          saveLeadFromFacebookAndInstagramTag(ad, idCampagna);
        });
      })
      .catch((error) => {
        console.error('Errore nella richiesta:', error);
      });
  };

  exports.getTagLeads2 = () => {
    axios
      .get(`${apiUrl}/${idCampagna2}`, {
        params: {
          fields,
          access_token: TOKENMIO,
        },
      })
      .then((response) => {
        console.log(response.data.ads.data);
        response.data.ads.data.forEach((ad) => {
          saveLeadFromFacebookAndInstagramTag(ad, idCampagna2);
        });
      })
      .catch((error) => {
        console.error('Errore nella richiesta:', error);
      });
  };
// ID SALESPARK act_489800240581683
  exports.getSalesparkLead = () => {
    console.log('Eseguo getSalesparkLead');
    const url = 'https://graph.facebook.com/v17.0/act_489800240581683/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: TOKEN1,
    };

    axios.get(url, { params })
      .then(response => {
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
            if (element.id === "120212580101710769") {
              const { account_id, ads, effective_status, id, name, objective, adsets, status } = element;
              console.log(element);
              if (ads && ads.data && ads.data.length > 0) {
                for (const ad of ads.data) {
                  if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
                    for (const lead of ad.leads.data) {
                      if (lead && lead.field_data && Array.isArray(lead.field_data)) {
                        const fieldData = lead.field_data;
                        const id = lead.id;
                        const formId = lead.form_id;
                        const log = {
                          fieldData: fieldData,
                          name: name,
                          id: id,
                          formId: formId,
                          annunci: ad.name,
                          adsets: adsets.data[0].name,
                        };
                        logs.push(log);
                        //console.log(logs);
                      }
                    }
                  }
                }
              }              
            }
          }
        } else {
          console.error("dataFromFacebook non è un array");
        }
        saveLeadFromFacebookAndInstagram(logs);
      })
      .catch(error => {
        console.error('Errore:', error);
      });
  };
//ACCOUNT 2.0 ACT_627545782710130
  exports.getDentistaLead2 = () => {
    const url = 'https://graph.facebook.com/v17.0/act_627545782710130/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: TOKEN1,
    };

    axios.get(url, { params })
      .then(response => {
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
            const excludedCampaignIds = [idCampagna, idCampagna2];
            //PER ESCLUDERE LE CAMPAGNE
            /*if (excludedCampaignIds.includes(element.id)) {
              console.log('Ho escluso:', element.id);
              continue;
            }*/

            const { account_id, ads, effective_status, id, name, objective, adsets, status } = element;

            if (ads && ads.data && ads.data.length > 0) {
              for (const ad of ads.data) {
                if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
                  for (const lead of ad.leads.data) {
                    if (lead && lead.field_data && Array.isArray(lead.field_data)) {
                      const fieldData = lead.field_data;
                      const id = lead.id;
                      const formId = lead.form_id;
                      const log = {
                        fieldData: fieldData,
                        name: name,
                        id: id,
                        formId: formId,
                        annunci: ad.name,
                        adsets: adsets.data[0].name,
                      };
                      logs.push(log);
                    }
                  }
                }
              }
            }
          }
        } else {
          console.error("dataFromFacebook non è un array");
        }
        saveLeadFromFacebookAndInstagram(logs);
      })
      .catch(error => {
        console.error('Errore:', error);
      });
  };
  // ACCOUNT 3.0 ACT_915414373405841
  exports.getDentistaLead3 = () => {
    const url = 'https://graph.facebook.com/v17.0/act_915414373405841/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: TOKEN1,
    };

    axios.get(url, { params })
      .then(response => {
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
            const excludedCampaignIds = [idCampagna, idCampagna2];
            //PER ESCLUDERE LE CAMPAGNE
            /*if (excludedCampaignIds.includes(element.id)) {
              console.log('Ho escluso:', element.id);
              continue;
            }*/

            const { account_id, ads, effective_status, id, name, objective, adsets, status } = element;

            if (ads && ads.data && ads.data.length > 0) {
              for (const ad of ads.data) {
                if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
                  for (const lead of ad.leads.data) {
                    if (lead && lead.field_data && Array.isArray(lead.field_data)) {
                      const fieldData = lead.field_data;
                      const id = lead.id;
                      const formId = lead.form_id;
                      const log = {
                        fieldData: fieldData,
                        name: name,
                        id: id,
                        formId: formId,
                        annunci: ad.name,
                        adsets: adsets.data[0].name,
                      };
                      logs.push(log);
                    }
                  }
                }
              }
            }
          }
        } else {
          console.error("dataFromFacebook non è un array");
        }
        saveLeadFromFacebookAndInstagram(logs);
      })
      .catch(error => {
        console.error('Errore:', error);
      });
  };

  exports.getBludentalLead = () => {
    const url = 'https://graph.facebook.com/v17.0/act_982532079362123/campaigns';
    const params = {
      fields: 'effective_status,account_id,id,name,objective,status,adsets{name},ads{name,leads{form_id,field_data}}',
      effective_status: "['ACTIVE']",
      access_token: TOKENBLUDENTAL,
    };

    axios.get(url, { params })
      .then(response => {
        const dataFromFacebook = response.data.data;
        const logs = [];
        if (Array.isArray(dataFromFacebook)) {
          for (const element of dataFromFacebook) {
            const excludedCampaignIds = [idCampagna, idCampagna2];
            //PER ESCLUDERE LE CAMPAGNE
            /*if (excludedCampaignIds.includes(element.id)) {
              console.log('Ho escluso:', element.id);
              continue;
            }*/

            const { account_id, ads, effective_status, id, name, objective, adsets, status } = element;

            if (ads && ads.data && ads.data.length > 0) {
              for (const ad of ads.data) {
                if (ad.leads && ad.leads.data && ad.leads.data.length > 0) {
                  for (const lead of ad.leads.data) {
                    if (lead && lead.field_data && Array.isArray(lead.field_data)) {
                      const fieldData = lead.field_data;
                      const id = lead.id;
                      const formId = lead.form_id;
                      const log = {
                        fieldData: fieldData,
                        name: name,
                        id: id,
                        formId: formId,
                        annunci: ad.name,
                        adsets: adsets.data[0].name,
                      };
                      logs.push(log);
                    }
                  }
                }
              }
            }
          }
        } else {
          console.error("dataFromFacebook non è un array");
        }
        saveLeadFromFacebookAndInstagram(logs);
      })
      .catch(error => {
        console.error('Errore:', error);
      });
  };