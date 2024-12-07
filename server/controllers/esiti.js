const express = require('express');
const mongoose = require('mongoose');
const Esito = require("../models/esitoModel")
const User = require("../models/user");
const Lead = require('../models/lead');

exports.createEsito = async (req, res) => {
    try {
        const { nome, codice_colore, posizione, userId } = req.body;
    
        if (!userId) {
          return res.status(400).json({ message: 'UserId è richiesto' });
        }
    
        // Crea un nuovo esito personalizzato associato all'utente
        const nuovoEsito = new Esito({
          nome,
          codice_colore,
          posizione,
          fix: false,  // Gli esiti creati dall'utente hanno sempre fix: false
          utente: userId // Colleghiamo l'esito all'utente
        });
    
        // Salva il nuovo esito nel database
        await nuovoEsito.save();
        return res.status(201).json({ message: 'Esito creato con successo', esito: nuovoEsito });
      } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Errore del server', details: error.message });
      }
};

// API per modificare un esito esistente
exports.modificaEsito = async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, codice_colore, posizione, userId } = req.body;
  
      // Trova l'esito da modificare
      let esito = await Esito.findById(id);
  
      if (!esito) {
        return res.status(404).json({ message: 'Esito non trovato' });
      }
  
      // Salva il nome precedente
      const nomePrecedente = esito.nome;
  
      // Aggiorna l'esito
      esito.nome = nome || esito.nome;
      esito.codice_colore = codice_colore || esito.codice_colore;
      esito.posizione = posizione || esito.posizione;
  
      // Salva le modifiche
      await esito.save();
  
      // Se il nome è stato modificato, aggiorna tutte le lead associate
      if (nome && nome !== nomePrecedente) {
        await Lead.updateMany(
          { utente: userId, esito: nomePrecedente },
          { $set: { esito: nome } }
        );
      }
  
      return res.status(200).json({ message: 'Esito modificato con successo', esito });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Errore del server', details: error.message });
    }
  };

  // API per eliminare un esito
exports.deleteEsito = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
  
      // Trova l'esito da eliminare
      let esito = await Esito.findById(id);
  
      if (!esito) {
        return res.status(404).json({ message: 'Esito non trovato' });
      }
  
      // Impedisce l'eliminazione di un esito predefinito
      if (esito.fix) {
        return res.status(403).json({ message: 'Non puoi eliminare un esito predefinito' });
      }
  
      // Verifica che l'esito appartenga all'utente
      if (esito.utente.toString() !== userId) {
        return res.status(403).json({ message: 'Non hai il permesso di eliminare questo esito' });
      }
  
      // Elimina l'esito
      await Esito.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Esito eliminato con successo' });
    } catch (error) {
      return res.status(500).json({ error: 'Errore del server', details: error.message });
    }
  };  

  // API per ottenere tutti gli esiti di un utente
exports.getEsiti = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const esiti = await Esito.find({
        $or: [
          { utente: userId },
        ]
      });
  
      return res.status(200).json({ esiti });
    } catch (error) {
      return res.status(500).json({ error: 'Errore del server', details: error.message });
    }
  };
  

  async function creaEsitiPredefiniti(userId) {
    const esitiPredefiniti = [
      { nome: 'Da contattare', codice_colore: '#ff0000', posizione: 1, fix: true },
      { nome: 'Da richiamare', codice_colore: '#00ff00', posizione: 2, fix: true },
      { nome: 'Non interessato', codice_colore: '#0000ff', posizione: 3, fix: true },
      { nome: 'Opportunità', codice_colore: '#ffff00', posizione: 4, fix: true },
      { nome: 'Venduto', codice_colore: '#ff00ff', posizione: 5, fix: true }
    ];
  
    for (let esito of esitiPredefiniti) {
      // Verifica se esito predefinito esiste già per questo utente
      let esitoEsistente = await Esito.findOne({ nome: esito.nome, utente: userId });
      if (!esitoEsistente) {
        await Esito.create({ ...esito, utente: userId });
      }
    }
  }

  //creaEsitiPredefiniti("6703b24559fdcb414e62cda1")

  async function creaEsitiPerTuttiGliUtenti() {
    try {
      // Recupera tutti gli utenti dal database
      const users = await User.find();
  
      // Per ogni utente, crea gli esiti predefiniti
      for (let user of users) {
        await creaEsitiPredefiniti(user._id);
      }
  
      console.log('Esiti predefiniti creati per tutti gli utenti');
    } catch (error) {
      console.error('Errore durante la creazione degli esiti predefiniti:', error);
    }
  }  
