const express = require('express');
const router = express.Router();
const { getWebhook, postWebhook } = require('../controllers/social');
const { getDataFromWordpress, salesParkLead } = require('../controllers/wordpress');

router.get('/webhook', getWebhook);
router.post('/webhook', postWebhook);
//router.post('/save-leads-facebook', saveLeadFromFacebookAndInstagram);

/*WORDPRESS */
router.post('/post-data-from-wordpress', getDataFromWordpress);
router.get('/get-data-from-wordpress', getDataFromWordpress);

router.post("/salespark-lead", salesParkLead);

module.exports = router;