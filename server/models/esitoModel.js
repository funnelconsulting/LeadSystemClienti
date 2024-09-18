const mongoose = require('mongoose');

// Definizione dello schema per l'Esito
const EsitoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  codice_colore: { type: String, required: true },  // Il colore associato
  posizione: { type: Number, required: true },      // La posizione nell'ordine degli esiti
  fix: { type: Boolean, default: false },
  utente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }    // True se è un esito predefinito, false se creato dall'utente
});

EsitoSchema.index({ nome: 1, utente: 1 }, { unique: true });
const Esito = mongoose.model('Esito', EsitoSchema);

module.exports = Esito;