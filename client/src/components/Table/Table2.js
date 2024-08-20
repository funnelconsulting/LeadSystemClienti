import React, { Suspense } from "react";
import { useState, useEffect, useContext, useRef } from "react";
import './Table2.scss';
import { UserContext } from '../../context';
import axios from "axios";
import toast from "react-hot-toast";
import './LeadEntry.scss'
import { IoIosArrowDown } from 'react-icons/io';
import '../MainDash/MainDash.scss';
import listaImg from '../../imgs/lista.png';
import LeadEntry from "./LeadEntry.jsx";
import cancel from '../../imgs/cancel.png';
import cestinonero from '../../imgs/cestinonero.png';
import LeadHeader from "./LeadHeader.jsx";
import PopupModify from "./popupModify/PopupModify";
import AddLeadPopup from "./popupAdd/PopupAdd";
import moment from "moment";
import { DatePicker, Select, Dropdown, Switch, Popover } from 'antd';
const PopupMotivo = React.lazy(() => import("./popupMotivo/PopupMotivo.js"));
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Table2({ onResults, searchval, setLeadsPdf, setNextSchedule }) {
  const [state, setState, headerIndex, SETheaderIndex] = useContext(UserContext);
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [esitoOpen, setEsitoOpen] = useState(false);
  const [orientatoriOpen, setOrientatoriOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [originalData, setOriginalData] = useState([]);
  const [popupModify, setPopupModify] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [esito, setEsito] = useState('');
  const [fatturato, setFatturato] = useState('0');
  const [popupModifyEsito, setPopupModifyEsito] = useState(false);
  const [toggleGrid, SETtogglegrid] = useState();
  const [orientatoriOptions, setOrientatoriOptions] = useState([]);
  const [selectedOrientatore, setSelectedOrientatore] = useState();
  const [selectedOrientatoreToChange, setSelectedOrientatoreToChange] = useState();
  const [changeOrientatore, setChangeOrientatore] = useState(false);
  const [patientType, setPatientType] = useState('');
  const [treatment, setTreatment] = useState('');
  const [location, setLocation] = useState('');
  const [leadMancantiPopup, setLeadMancantiPopup] = useState(true);
  const [filtroDiRiserva, setFiltroDiRiserva] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const cities = [
    "Abbiategrasso", "Anzio", "Arezzo", "Bari", "Bergamo", "Biella", "Bologna", "Brescia", "Busto Arsizio", "Cagliari", 
    "Cantù", "Capena", "Carpi", "Cassino", "Cesena", "Ciampino", "Cinisello Balsamo", "Civitavecchia", "Cologno Monzese", 
    "Como", "Cremona", "Desenzano del Garda", "Ferrara", "Firenze", "Forlì", "Frosinone", "Genova", "Latina", "Lodi", 
    "Lucca", "Mantova", "Melzo", "Mestre", "Milano", "Modena", "Monza", "Ostia", "Padova", "Perugia", "Parma", "Piacenza", 
    "Pioltello", "Pomezia", "Prato", "Ravenna", "Reggio Emilia", "Rho", "Roma", "San Giuliano Milanese", "Sassari", "Seregno", 
    "Terni", "Torino", "Treviso", "Varese", "Verona", "Vicenza", "Vigevano"
  ];

  const [motivo, setMotivo] = useState();
  const ori = localStorage.getItem("Ori");
  const popupRef = useRef(null);
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setEsitoOpen(false);
      setOrientatoriOpen(false);
      setCalendarOpen(false);
      setPopupModifyEsito(false);
      setAddOpen(false);
      setPopupModify(false);
      setChangeOrientatore(false);
      setPopupMotivi(false);
    }
  };

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

const [motivoLeadPersaList, setMotivoLeadPersaList] = useState([
    "Numero Errato", "Non interessato", "Non ha mai risposto"
]);

  document.addEventListener('mousedown', handleClickOutside);

  const userId = state.user._id;
  const userFixId = state.user.role && state.user.role === "orientatore" ? state.user.utente : state.user._id;
  const handleRowClick = (lead) => {
     setSelectedLead(lead);
     setDeleting(true);
     SETheaderIndex(0)
  };


  useEffect(() => {
    const getOrientatori = async () => {
      await axios.get(`/utenti/${userId}/orientatori`)
        .then(response => {
          const data = response.data.orientatori;
          setOrientatoriOptions(data);
          fetchLeads(data);
        })
        .catch(error => {
          console.error(error);
        });
    }

    if (state && state.token) {
      if (state.user.role && state.user.role === "orientatore") {
        getOrientatoreLeads()
      } else {
        getOrientatori()
      }
    };
    const ori = localStorage.getItem("Ori");
    const startDate = localStorage.getItem("startDate");
    const endDate = localStorage.getItem("endDate");
    const recall = localStorage.getItem("recallFilter");
    if (ori && ori !== null && ori !== undefined) {
      setSelectedOrientatore(ori);
      console.log('HO cambiat ori')
    };

    if (recall && recall !== undefined && recall == "true"){
      setRecallFilter(true)
    }

    if (startDate && startDate !== null && startDate !== undefined){
      setStartDate(startDate)
    }

    if (endDate && endDate !== null && endDate !== undefined){
      setEndDate(endDate)
    }
  }, [])


  useEffect(() => {
    let ls = localStorage.getItem("toggleGrid")
    if (ls) {
      if (ls == "off")
        SETtogglegrid(false)
      else
        if (ls == "on")
          SETtogglegrid(true)

    } else {
      SETtogglegrid(false)
      localStorage.setItem("toggleGrid", "off")
    }
  }, [])

  const patientTypes = ["Nuovo paziente", "Gia’ paziente"];
  const treatments = ["Impianti", "Pulizia dei denti", "Protesi Mobile", "Sbiancamento", "Ortodonzia", "Faccette dentali"];
  const locations = [
    "Desenzano Del Garda", "Melzo", "Carpi", "Lodi", "Cantù", "Mantova", "Seregno", "Milano Piazza Castelli", "Abbiategrasso",
    "Pioltello", "Vigevano", "Milano Via Parenzo", "Settimo Milanese", "Cremona", "Milano Lomellina", "Monza", "Busto Arsizio", "Brescia",
    "Cinisello Balsamo", "Cologno Monzese", "Varese", "Como", "San Giuliano Milanese", "Milano Brianza", "Bergamo", "Roma Marconi",
    "Roma Balduina", "Roma Prati Fiscali", "Roma Casilina", "Roma Tiburtina", "Roma Torre Angela", "Ostia", "Pomezia",
    "Ciampino", "Capena", "Cassino", "Frosinone", "Latina", "Valmontone outlet", "Roma Tuscolana", "Civitavecchia",
    "Terni", "Perugia", "Arezzo", "Firenze", "Lucca", "Prato", "Piacenza", "Ferrara", "Cesena", "Forlì", "Reggio Emilia",
    "Modena", "Parma", "Bologna", "Rovigo", "Treviso", "Padova", "Verona", "Vicenza", "Mestre", "Torino Chironi",
    "Settimo Torinese", "Biella", "Torino Botticelli", "Bari", "Genova", "Cagliari", "Sassari", "Pordenone", "Rimini",
    "Ravenna", "Rho", "Anzio"
  ];

  const [selectedStatusEsito, setSelectedStatusEsito] = useState({
    dacontattare: false,
    inlavorazione: false,
    noninteressato: false,
    opportunita: false,
    invalutazione: false,
    venduto: false,
    nonValido: false,
  });

  const [esitoToFilter, setEsitoToFilter] = useState();
  const [refreshate, setRefreshate] = useState(true);

  const cambiaEsito = (esito) => {
    if (esito == "Nessun filtro"){
      setEsitoToFilter();
    } else {
      setEsitoToFilter(esito);
    }
  }

  const toggleFilter = (filter) => {
    setSelectedStatusEsito((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };
  
  const getOrientatoreLeads = async () => {
    try {
      const response = await axios.post('/get-orientatore-lead-base', {
        _id: state.user._id
      });

      const filteredTableLead = response.data.map((lead) => {
        const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
        const cleanedTelephone =
          telephone.startsWith('+39') && telephone.length === 13
            ? telephone.substring(3)
            : telephone;

        return {
          name: lead.nome,
          surname: lead.cognome,
          email: lead.email,
          date: lead.data,
          telephone: cleanedTelephone,
          status: lead.esito,
          orientatore: lead.orientatori ? lead.orientatori.nome.trim() + ' ' + lead.orientatori.cognome.trim() : '',
          fatturato: lead.fatturato ? lead.fatturato : '',
          provenienza: lead.campagna,
          città: lead.città ? lead.città : '',
          trattamento: lead.trattamento ? lead.trattamento : '',
          campoPlus: lead.campoPlus ? lead.campoPlus : '',
          note: lead.note ? lead.note : '',
          id: lead._id,
          etichette: lead.etichette ? lead.etichette : null,
          motivo: lead.motivo ? lead.motivo : null,
          recallHours: lead.recallHours ? lead.recallHours : null,
          recallDate: lead.recallDate ? lead.recallDate : null,
          lastModify: lead.lastModify ? lead.lastModify : null, 
          campagna: lead.utmCampaign ? lead.utmCampaign : "",
          tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "0",
          appDate: lead.appDate ? lead.appDate : null,
          summary: lead.summary ? lead.summary : ''
        };
      });

      const recall = localStorage.getItem("recallFilter");

      const filteredByRecall = filteredTableLead.filter((lead) => {
        if (lead.recallDate && recall && recall === "true") {
          const recallDate = new Date(lead.recallDate);
          const today = new Date();
          return recallDate <= today;
        } else if (recall === false || recall == undefined || !recall) {
          return true;
        }
        return false;
      });

      const searchWords = searchval.toLowerCase().split(' ');
      const filteredDataIn = filteredByRecall.filter(r => {
        const fullName = `${r.name.trim()}`.toLowerCase();

        console.log('Search Words:', searchWords);
        console.log('Full Name:', fullName);

        return searchWords.every(word => fullName.indexOf(word) !== -1) || r.telephone.toLowerCase().includes(searchval.toLowerCase());
      })

      const startDate = localStorage.getItem("startDate");
      const endDate = localStorage.getItem("endDate");
      if (startDate !== null && endDate !== null && startDate !== undefined && endDate !== undefined){
        const filteredByDate = filterDataByDate(filteredDataIn, startDate, endDate); 
        setFilteredData(filteredByDate);
        setFiltroDiRiserva(filteredByDate)
       } else {
        setFilteredData(filteredDataIn);
        setFiltroDiRiserva(filteredDataIn);
       }

      const leadNumVenduti = response.data.filter(lead => lead.esito === 'Fissato');
      const leadNum = response.data.length;
      onResults(leadNum, leadNumVenduti.length);
      setOriginalData(filteredTableLead);
      setLeadsPdf(filteredTableLead);

      const filteredLead = response.data
      .filter(lead => {
        return lead.recallDate && lead.recallHours; // Assicurati che entrambi siano definiti
      })
      .map(lead => {
        // Combina la data e l'ora per ottenere una data completa
        const combinedDateTime = moment(lead.recallDate + ' ' + lead.recallHours, 'YYYY-MM-DD HH:mm');
        return {
          ...lead,
          combinedDateTime: combinedDateTime // Aggiungi la data completa come proprietà aggiuntiva
        };
      })
      .filter(lead => {
        // Filtra solo le lead con una data futura o uguale all'ora attuale
        return lead.combinedDateTime.isSameOrAfter(moment());
      })
      .sort((leadA, leadB) => {
        // Ordina in base alla data completa
        return leadA.combinedDateTime - leadB.combinedDateTime;
      });
    
    let nextAppointmentLead = null;
    if (filteredLead.length > 0) {
      nextAppointmentLead = filteredLead[0];
    }
      setNextSchedule(nextAppointmentLead);
    } catch (error) {
      console.error(error.message);
    }
  }

  const fetchLeads = async (orin) => {

    try {
      const response = await axios.post('/get-leads-manual-base', {
        _id: state.user._id
      });


      const filteredTableLead = response.data.map((lead) => {
        const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
        const cleanedTelephone =
          telephone.startsWith('+39') && telephone.length === 13
            ? telephone.substring(3)
            : telephone;


        return {
          name: lead.nome,
          surname: lead.cognome,
          email: lead.email,
          date: lead.data,
          telephone: cleanedTelephone,
          status: lead.esito,
          orientatore: lead.orientatori ? lead.orientatori.nome.trim() + ' ' + lead.orientatori.cognome.trim() : '',
          fatturato: lead.fatturato ? lead.fatturato : '',
          provenienza: lead.campagna,
          città: lead.città ? lead.città : '',
          trattamento: lead.trattamento ? lead.trattamento : '',
          campoPlus: lead.campoPlus ? lead.campoPlus : '',
          note: lead.note ? lead.note : '',
          id: lead._id,
          etichette: lead.etichette ? lead.etichette : null,
          motivo: lead.motivo ? lead.motivo : null,
          recallHours: lead.recallHours ? lead.recallHours : null,
          recallDate: lead.recallDate ? lead.recallDate : null,
          lastModify: lead.lastModify ? lead.lastModify : null, 
          campagna: lead.utmCampaign ? lead.utmCampaign : "",
          tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "0",
          appDate: lead.appDate ? lead.appDate : null,
          summary: lead.summary ? lead.summary : '',
          linkChat: lead.linkChat ? lead.linkChat : "",
        };
      });

      const ori = localStorage.getItem("Ori");
      const recall = localStorage.getItem("recallFilter");

      const filteredByOrientatore = filteredTableLead.filter((row) => {
        if (ori && ori !== null && ori !== undefined && orin.length > 0) {
          const selectedOrientatoreObj = orin.find(option => option._id === ori);
          const selectedOrientatoreFullName = selectedOrientatoreObj ? selectedOrientatoreObj.nome + ' ' + selectedOrientatoreObj.cognome : '';
          const rowOrientatoreFullName = row.orientatore;
          return rowOrientatoreFullName === selectedOrientatoreFullName;
        } else if (ori === "nonassegnato") {
          const rowOrientatoreFullName = row.orientatore;
          return rowOrientatoreFullName === "";
        } else {
          return true;
        }
      });

      const filteredByRecall = filteredByOrientatore.filter((lead) => {
        if (lead.recallDate && recall && recall === "true") {
          const recallDate = new Date(lead.recallDate);
          const today = new Date();
          return recallDate <= today;
        } else if (recall === false || recall == undefined || !recall) {
          return true;
        }
        return false;
      });

      const searchWords = searchval.toLowerCase().split(' ');
      const filteredDataIn = filteredByRecall.filter(r => {
        const fullName = `${r.name.trim()}`.toLowerCase();

        console.log('Search Words:', searchWords);
        console.log('Full Name:', fullName);

        return searchWords.every(word => fullName.indexOf(word) !== -1) || r.telephone.toLowerCase().includes(searchval.toLowerCase());
      })

      const startDate = localStorage.getItem("startDate");
      const endDate = localStorage.getItem("endDate");
      if (startDate !== null && endDate !== null && startDate !== undefined && endDate !== undefined){
        const filteredByDate = filterDataByDate(filteredDataIn, startDate, endDate); 
        setFilteredData(filteredByDate);
        setFiltroDiRiserva(filteredByDate)
       } else {
        setFilteredData(filteredDataIn);
        setFiltroDiRiserva(filteredDataIn);
       }

      const leadNumVenduti = response.data.filter(lead => lead.esito === 'Fissato');
      const leadNum = response.data.length;
      onResults(leadNum, leadNumVenduti.length);
      setOriginalData(filteredTableLead);
      setLeadsPdf(filteredTableLead);

      const filteredLead = response.data
      .filter(lead => {
        return lead.recallDate && lead.recallHours; // Assicurati che entrambi siano definiti
      })
      .map(lead => {
        // Combina la data e l'ora per ottenere una data completa
        const combinedDateTime = moment(lead.recallDate + ' ' + lead.recallHours, 'YYYY-MM-DD HH:mm');
        return {
          ...lead,
          combinedDateTime: combinedDateTime // Aggiungi la data completa come proprietà aggiuntiva
        };
      })
      .filter(lead => {
        // Filtra solo le lead con una data futura o uguale all'ora attuale
        return lead.combinedDateTime.isSameOrAfter(moment());
      })
      .sort((leadA, leadB) => {
        // Ordina in base alla data completa
        return leadA.combinedDateTime - leadB.combinedDateTime;
      });
    
    let nextAppointmentLead = null;
    if (filteredLead.length > 0) {
      nextAppointmentLead = filteredLead[0];
    }
      setNextSchedule(nextAppointmentLead);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const filteredDataIn = originalData.filter((row) => {
      const filterNum = parseInt(filterValue);
      if (!isNaN(filterNum)) {
        return typeof row.telephone === 'string' && row.telephone.startsWith(filterValue);
      } else {
        const searchTerms = filterValue.toLowerCase().split(' ');

        const fullName = row.name.toLowerCase();
        return searchTerms.every(term => fullName.includes(term));
      }
    }).map((row) => {
      return {
        id: row.id,
        name: row.name,
        date: row.date,
        telephone: row.telephone,
        status: row.status,
        orientatore: row.orientatore,
        email: row.email,
        note: row.note,
        fatturato: row.fatturato,
        città: row.città ? row.città : '',
        trattamento: row.trattamento ? row.trattamento : '',
        campoPlus: row.campoPlus ? row.campoPlus : '',
        campagna: row.campagna,
        motivo: row.motivo,
        recallHours: row.recallHours,
        recallDate: row.recallDate,
        lastModify: row.lastModify,
        campagna: row.utmCampaign,
        tentativiChiamata: row.tentativiChiamata ? row.tentativiChiamata : "0",
        linkChat: row.linkChat ? row.linkChat : "",
      };
    });
    setFilteredData(filteredDataIn);
  }, [filterValue]);

  const handleClickDate = () => {
    const filteredDataNew = filterDataByDate(filteredData, startDate, endDate);
    setFilteredData(filteredDataNew);
    setCalendarOpen(false);
    document.body.classList.remove("overlay");
  }

  const handleClickEsito = () => {
          const filteredDataNew = filteredData.filter((row) => {
      if (selectedStatusEsito.venduto && row.status === 'Fissato') {
        return true;
      } else if (selectedStatusEsito.dacontattare && row.status === 'Da contattare') {
        return true;
      } else if (selectedStatusEsito.inlavorazione && row.status === 'In lavorazione') {
        return true;
      } else if (selectedStatusEsito.invalutazione && row.status === 'In valutazione') {
        return true;
      } else if (selectedStatusEsito.opportunita && row.status === 'Opportunità') {
        return true;
      } else if (selectedStatusEsito.noninteressato && row.status === 'Non interessato') {
        return true;
      } else if (selectedStatusEsito.nonValido && row.status === 'Non valido') {
        return true;
      }
      return false;
    });
    setFilteredData(filteredDataNew);

    setOrientatoriOpen(false);
    setEsitoOpen(false);

  }

  useEffect(() => {
    if (filterValue === '') {
      setFilteredData(originalData);
    }
  }, [filterValue]);

  const filterDataByDate = (data, startDate, endDate) => {
    const filteredData = data.filter((row) => {
      const rowDate = Date.parse(row.date);
      const selectedDateStart = new Date(startDate);
      const selectedDateEnd = new Date(endDate);
      selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);
      return rowDate >= selectedDateStart && rowDate <= selectedDateEnd;
    });

    return filteredData;
  };

  const handleClearFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredData(originalData);
    setSelectedFilter('');
    setSelectedCity("");
    setSelectedOrientatore("");
    localStorage.removeItem("Ori");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    localStorage.removeItem("recallFilter");
    setRecallFilter(false);
  };

  const handleClearDate = () => {
      setStartDate(null);
      setEndDate(null);
      localStorage.removeItem("startDate");
      localStorage.removeItem("endDate");
  }

  const handleClearOri = () => {
    setSelectedOrientatore("");
    localStorage.removeItem("Ori");
}

  const [recallFilter, setRecallFilter] = useState(false);
  useEffect(() => {
    // Filtra per recall
    const filteredByRecall = originalData.filter((lead) => {
      if (lead.recallDate && lead.recallHours && recallFilter === true) {
        const recallDate = new Date(lead.recallDate);
        const today = new Date();
        return recallDate <= today;
      } else if (recallFilter === false) {
        return true;
      }
      return false;
    });

    // Filtra per orientatore
    const filteredByOrientatore = originalData.filter((row) => {
      if (selectedOrientatore == null || selectedOrientatore === "") {
        return true;
      } else if (selectedOrientatore == "nonassegnato") {
        const rowOrientatoreFullName = row.orientatore;
        return rowOrientatoreFullName === "";
      } else {
        const selectedOrientatoreObj = orientatoriOptions.find(option => option._id === selectedOrientatore);
        const selectedOrientatoreFullName = selectedOrientatoreObj ? selectedOrientatoreObj.nome + ' ' + selectedOrientatoreObj.cognome : '';
        const rowOrientatoreFullName = row.orientatore;
        return rowOrientatoreFullName === selectedOrientatoreFullName;
      }
    });

    // Filtra per data
    if (startDate !== null && endDate !== null){
     const filteredByDate = filterDataByDate(originalData, startDate, endDate); 
     let combinedFilteredData = filteredByRecall.filter(row => filteredByOrientatore.includes(row) && filteredByDate.includes(row));
     if (selectedCity) {
      combinedFilteredData = combinedFilteredData.filter(row => row.città.toLowerCase() === selectedCity.toLowerCase());
    }
     setFilteredData(combinedFilteredData);
     setFiltroDiRiserva(combinedFilteredData);
    } else {
      let combinedFilteredData = filteredByRecall.filter(row => filteredByOrientatore.includes(row));
      if (selectedCity) {
        combinedFilteredData = combinedFilteredData.filter(row => row.città.toLowerCase() === selectedCity.toLowerCase());
      }
      setFilteredData(combinedFilteredData);
      setFiltroDiRiserva(combinedFilteredData);
    }
    
    
  }, [recallFilter, selectedOrientatore, startDate, endDate, selectedCity]);

  const getOtherLeads = async () => {
    try {
      const response = await axios.post('/get-other-leads', {
        _id: state.user._id
        //_id: "655f707143a59f06d5d4dc3b" //ONE NETWORK
        //_id: "65b135d2318336cd0bfc4361" //WIKIBE
      });

      const filteredTableLead = response.data.map((lead) => {
        const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
        const cleanedTelephone =
          telephone.startsWith('+39') && telephone.length === 13
            ? telephone.substring(3)
            : telephone;


        return {
          name: lead.nome,
          surname: lead.cognome,
          email: lead.email,
          date: lead.data,
          telephone: cleanedTelephone,
          status: lead.esito,
          orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
          fatturato: lead.fatturato ? lead.fatturato : '',
          provenienza: lead.campagna,
          città: lead.città ? lead.città : '',
          trattamento: lead.trattamento ? lead.trattamento : '',
          campoPlus: lead.campoPlus ? lead.campoPlus : '',
          note: lead.note ? lead.note : '',
          id: lead._id,
          etichette: lead.etichette ? lead.etichette : null,
          motivo: lead.motivo ? lead.motivo : null,
          recallHours: lead.recallHours ? lead.recallHours : null,
          recallDate: lead.recallDate ? lead.recallDate : null,
          lastModify: lead.lastModify ? lead.lastModify : null, 
          campagna: lead.utmCampaign ? lead.utmCampaign : "",
          tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "0",
          appDate: lead.appDate ? lead.appDate : null,
          summary: lead.summary ? lead.summary : '',
          linkChat: lead.linkChat ? lead.linkChat : "",
        };
      });

      const ori = localStorage.getItem("Ori");
      const recall = localStorage.getItem("recallFilter");
      const filteredByOrientatore = filteredTableLead.filter((row) => {
        if (ori && ori !== null && ori !== undefined && orientatoriOptions.length > 0) {
          const selectedOrientatoreObj = orientatoriOptions.find(option => option._id === ori);
          const selectedOrientatoreFullName = selectedOrientatoreObj ? selectedOrientatoreObj.nome + ' ' + selectedOrientatoreObj.cognome : '';
          const rowOrientatoreFullName = row.orientatore;
          return rowOrientatoreFullName === selectedOrientatoreFullName;
        } else if (ori === "nonassegnato") {
          const rowOrientatoreFullName = row.orientatore;
          return rowOrientatoreFullName === "";
        } else {
          return true;
        }
      });

      const filteredByRecall = filteredByOrientatore.filter((lead) => {
        if (lead.recallDate && recall && recall === "true") {
          const recallDate = new Date(lead.recallDate);
          const today = new Date();
          return recallDate <= today;
        } else if (recall === false || recall == undefined || !recall) {
          return true;
        }
        return false;
      });

      const startDate = localStorage.getItem("startDate");
      const endDate = localStorage.getItem("endDate");
      if (startDate !== null && endDate !== null && startDate !== undefined && endDate !== undefined){
        const filteredByDate = filterDataByDate(filteredByRecall, startDate, endDate); 
        setFilteredData((prevData) => [...prevData, ...filteredByDate]);
        setFiltroDiRiserva((prevData) => [...prevData, ...filteredByDate]);
       } else {
        setFilteredData((prevData) => [...prevData, ...filteredByRecall]);
        setFiltroDiRiserva((prevData) => [...prevData, ...filteredByRecall]);
       }
      setRefreshate(false);
      setOriginalData((prevData) => [...prevData, ...filteredTableLead]);
    } catch (error) {
      console.error(error);
    }
  }

  const getOtherLeadsOri = async () => {
    try {
      const response = await axios.post('/get-other-leads-ori', {
        _id: state.user._id
      });

      const filteredTableLead = response.data.map((lead) => {
        const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
        const cleanedTelephone =
          telephone.startsWith('+39') && telephone.length === 13
            ? telephone.substring(3)
            : telephone;


        return {
          name: lead.nome,
          surname: lead.cognome,
          email: lead.email,
          date: lead.data,
          telephone: cleanedTelephone,
          status: lead.esito,
          orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
          fatturato: lead.fatturato ? lead.fatturato : '',
          provenienza: lead.campagna,
          città: lead.città ? lead.città : '',
          trattamento: lead.trattamento ? lead.trattamento : '',
          campoPlus: lead.campoPlus ? lead.campoPlus : '',
          note: lead.note ? lead.note : '',
          id: lead._id,
          etichette: lead.etichette ? lead.etichette : null,
          motivo: lead.motivo ? lead.motivo : null,
          recallHours: lead.recallHours ? lead.recallHours : null,
          recallDate: lead.recallDate ? lead.recallDate : null,
          lastModify: lead.lastModify ? lead.lastModify : null, 
          campagna: lead.utmCampaign ? lead.utmCampaign : "",
          tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "0",
          appDate: lead.appDate ? lead.appDate : null,
          summary: lead.summary ? lead.summary : '',
          linkChat: lead.linkChat ? lead.linkChat : "",
        };
      });

      const recall = localStorage.getItem("recallFilter");

      const filteredByRecall = filteredTableLead.filter((lead) => {
        if (lead.recallDate && recall && recall === "true") {
          const recallDate = new Date(lead.recallDate);
          const today = new Date();
          return recallDate <= today;
        } else if (recall === false || recall == undefined || !recall) {
          return true;
        }
        return false;
      });

      const startDate = localStorage.getItem("startDate");
      const endDate = localStorage.getItem("endDate");
      if (startDate !== null && endDate !== null && startDate !== undefined && endDate !== undefined){
        const filteredByDate = filterDataByDate(filteredByRecall, startDate, endDate); 
        setFilteredData((prevData) => [...prevData, ...filteredByDate]);
        setFiltroDiRiserva((prevData) => [...prevData, ...filteredByDate]);
       } else {
        setFilteredData((prevData) => [...prevData, ...filteredByRecall]);
        setFiltroDiRiserva((prevData) => [...prevData, ...filteredByRecall]);
       }
      setRefreshate(false);
      setOriginalData((prevData) => [...prevData, ...filteredTableLead]);
    } catch (error) {
      console.error(error);
    }
  }

  const handleOpenAddPopup = () => {
    SETheaderIndex(0)
    setAddOpen(true);
  }

  const handleModifyPopup = (lead) => {
    setSelectedLead(lead);
    setPopupModify(true);
  }

  const handleModifyPopupEsito = (lead) => {
    setSelectedLead(lead);
    setPopupModifyEsito(true);

    setEsito(lead.status)

    SETheaderIndex(0)
  }

  const JustClosePopup = () => {
    setPopupModify(false);
  }

  const openChangeOrientatore = (lead) => {
    setChangeOrientatore(true);
    setSelectedLead(lead);
  }

  const updateOrientatore = async () => {
    const orientatori = selectedOrientatoreToChange;
    const leadId = selectedLead.id;
  
    try {
      const modifyLead = {
        orientatori
      };
  
      const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
      const updatedLead = response.data.updatedLead;

      setOriginalData((prevData) =>
        prevData.map((lead) => {
          if (lead.id === leadId) {
            const adaptedLead = {
              name: updatedLead.nome,
              surname: updatedLead.cognome,
              email: updatedLead.email,
              date: updatedLead.data,
              telephone: updatedLead.numeroTelefono,
              status: updatedLead.esito,
              orientatore: updatedLead.orientatori ? updatedLead.orientatori.nome + ' ' + updatedLead.orientatori.cognome : '',
              fatturato: updatedLead.fatturato ? updatedLead.fatturato : '',
              campagna: updatedLead.campagna,
              città: updatedLead.città ? updatedLead.città : '',
              note: updatedLead.note ? updatedLead.note : '',
              id: updatedLead._id,
              trattamento: updatedLead.trattamento,
              tentativiChiamata: updatedLead.tentativiChiamata ? updatedLead.tentativiChiamata : "0",
              linkChat: updatedLead.linkChat ? updatedLead.linkChat : "",
            };
            return { ...lead, ...adaptedLead };
          } else {
            return lead;
          }
        })
      );

      setFilteredData((prevData) =>
      prevData.map((lead) => {
        if (lead.id === leadId) {
          const adaptedLead = {
            name: updatedLead.nome,
            surname: updatedLead.cognome,
            email: updatedLead.email,
            date: updatedLead.data,
            telephone: updatedLead.numeroTelefono,
            status: updatedLead.esito,
            orientatore: updatedLead.orientatori ? updatedLead.orientatori.nome + ' ' + updatedLead.orientatori.cognome : '',
            fatturato: updatedLead.fatturato ? updatedLead.fatturato : '',
            campagna: updatedLead.campagna,
            città: updatedLead.città ? updatedLead.città : '',
            note: updatedLead.note ? updatedLead.note : '',
            id: updatedLead._id,
            trattamento: updatedLead.trattamento,
            campoPlus: updatedLead.campoPlus ? updatedLead.campoPlus : '',
            tentativiChiamata: updatedLead.tentativiChiamata ? updatedLead.tentativiChiamata : "0",
            linkChat: updatedLead.linkChat ? updatedLead.linkChat : "",
          };
          return { ...lead, ...adaptedLead };
        } else {
          return lead;
        }
      })
    );
      setChangeOrientatore(false);
      toast.success('Il lead è stato modificato con successo.');
    } catch (error) {
      console.error(error);
    }
  };
  

  const deleteLead = async (leadId) => {
    try {
      const response = await axios.delete('/delete-lead', { data: { id: leadId } });
      toast.success('Hai eliminato correttamente il lead');
      if (state.user.role && state.user.role === "orientatore"){
        getOrientatoreLeads();
      } else {
        fetchLeads(orientatoriOptions);
      } 
      setPopupModify(false);
      setDeleting(false);
      setRefreshate(true)
    } catch (error) {
      console.error(error.message);
      toast.error('Si è verificato un errore.')
    }
  };

  const handleDelete = (event) => {
    event.preventDefault();
    deleteLead(selectedLead.id)
  }

  const updateLeadEsito = async () => {
    const leadId = selectedLead.id
    try {
      if (esito === "Non valido" || esito === "Non interessato"){
        if (!motivo || motivo == ""){
          window.alert("Inserisci il motivo")
          return
        } else {
        const modifyLead = {
          esito,
          fatturato,
          motivo,
        }; 
        const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
        setPopupModifyEsito(false);
        SETheaderIndex(999);             
        }
      } else if (esito === "Venduto"){
        if (patientType === "" || treatment === "" || location === ""){
          window.alert("Compila i campi")
          return
        } else {
        const modifyLead = {
          esito,
          fatturato,
          tipo: patientType,
          trattPrenotato: treatment, 
          luogo: location,
        }; 
        const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
        setPopupModifyEsito(false);
        SETheaderIndex(999);             
        }
      } else {
        const motivo = "";
        const modifyLead = {
          esito,
          fatturato,
          motivo,
        };   
        const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
        setPopupModifyEsito(false);
        SETheaderIndex(999); 
      }
      if (state.user.role && state.user.role === "orientatore"){
        getOrientatoreLeads();
      } else{
        fetchLeads(orientatoriOptions);
      }
      setRefreshate(true)
      toast.success('Il lead è stato modificato con successo.')
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!esitoOpen) {
      setSelectedFilter('')
      SETheaderIndex(999)

    }
    else {
      SETheaderIndex(0)
    }
  }, [esitoOpen])

  useEffect(() => {
    if (!calendarOpen)
      setSelectedFilter('')
  }, [calendarOpen])


  const [toggles, SETtoggles] = useState({
    dacontattare: true,
    inlavorazione: false,
    noninteressato: true,
    opportunita: true,
    invalutazione: false,
    venduto: true,
    nonValido: false,
    nonRisponde: false,
    irraggiungibile: true,
    iscrizionePosticipata: false,
  })


  const formatDate = (originalDate) => {
    const formattedDate = new Date(originalDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = new Date(originalDate).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const finalFormat = `${formattedDate} ${formattedTime}`;
    return finalFormat;
  }




  useEffect(() => {
    if (popupModify)
      SETheaderIndex(0)
    else
      SETheaderIndex(999)
  }, [popupModify])

  useEffect(() => {
    if (searchval == ''){
      setFilteredData(filtroDiRiserva)
    } else {
      const searchWords = searchval.toLowerCase().split(' ');

      setFilteredData(
        filtroDiRiserva.filter(r => {
          const fullName = `${r.name.trim()}`.toLowerCase();

          console.log('Search Words:', searchWords);
          console.log('Full Name:', fullName);

          return searchWords.every(word => fullName.indexOf(word) !== -1) || r.telephone.toLowerCase().includes(searchval.toLowerCase());
        })
      );
    }
  }, [searchval])

  


  const handletogglegrid = () => {
    SETtogglegrid(!toggleGrid)

    localStorage.setItem("toggleGrid", localStorage.getItem("toggleGrid") == "on" ?
      "off" : "on"
    )
  }

  const handleDragEnd = (event) => {
    document.querySelectorAll(".secwrap").forEach(e => e.classList.remove("colordroprow"));
    //document.querySelectorAll('.move-entry').forEach(lead => {
    //  lead.classList.remove('move-entry');
    //});
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    document.querySelectorAll(".secwrap").forEach(e => e.classList.add("colordroprow"));
    
    //event.target.classList.add('move-entry');
  };

  const [popupMotivi, setPopupMotivi] = useState(false);
  const [typeMotivo, setTypeMotivo] = useState("");
  const [leadIdMotivo, setLeadIdMotivo] = useState("");

  const handleDrop = (event, type) => {
    event.preventDefault();

    const droppedItem = JSON.parse(event.dataTransfer.getData('text/plain'));
    const draggedLeadId = droppedItem.id;
    if (type === draggedLeadId.status) {
      return null
    } else if (type === "Non valido" || type === "Non interessato" || type === "Lead persa") {
      setPopupMotivi(true);
      setLeadIdMotivo(draggedLeadId);
      setTypeMotivo(type);
    } else {
      updateLeadEsito2(draggedLeadId, 0, type);
      const overlay = document.querySelector('.popup-open-shadows');
      if (overlay) {
          document.body.removeChild(overlay);
      }
    }

  };

  const updateLeadEsito2 = async (leadId, fatturato, esito) => {
    try {
      const modifyLead = {
        esito,
        fatturato,
      };
      const response = await axios.put(`/lead/${userFixId}/update/${leadId.id}`, modifyLead);

      toast.success('Il lead è stato modificato con successo.');
      if (state.user.role && state.user.role === "orientatore"){
        getOrientatoreLeads();
      } else{
        fetchLeads(orientatoriOptions);
      }
      setRefreshate(true)
      console.log(response.data.message);
    } catch (error) {
      console.error(error);
    }
  };

  const updateLeadEsitoConMotivo = async (motivo, leadId, fatturato, esito, tipo, trattPrenotato, luogo) => {
    setPopupMotivi(false);
    try {
      const modifyLead = {
        esito,
        fatturato,
        motivo,
        tipo, 
        trattPrenotato, 
        luogo
      };
      const response = await axios.put(`/lead/${userFixId}/update/${leadId.id}`, modifyLead);

      toast.success('Il lead è stato modificato con successo.');
      if (state.user.role && state.user.role === "orientatore"){
        getOrientatoreLeads();
      } else{
        fetchLeads(orientatoriOptions);
      }
      setRefreshate(true)
    } catch (error) {
      console.error(error);
    }
  };

  const secref = React.useRef();

  const [nuovaEtichetta, setNuovaEtichetta] = useState('');

  const handleUpdateLead = (updatedLead) => {
    setSelectedLead(updatedLead);
  };
  const handleStartDateChange = (date) => {
    if (date) {
      setStartDate(date.toDate());
      localStorage.setItem("startDate", date.toISOString());
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      setEndDate(date.toDate());
      localStorage.setItem("endDate", date.toISOString());
    }
  };
  const handleOrientatoreChange = (value) => {
    setSelectedOrientatore(value);
    localStorage.setItem("Ori", value);
  };

  return (
    <>
        {popupModify && 
        <div className="shadow-popup-modify">
        <PopupModify
        onClose={JustClosePopup}
        lead={selectedLead}
        onUpdateLead={handleUpdateLead}
        setPopupModify={() => setPopupModify(false)}
        deleteLead={deleteLead}
        popupRef={popupRef}
        setRefreshate={setRefreshate}
        fetchLeads={() => {
          if (state.user.role && state.user.role === "orientatore"){
            getOrientatoreLeads();
          } else{
            fetchLeads(orientatoriOptions);
          }
          setRefreshate(true)
        }}
         />
         </div>
         }
    <div className="Table-admin" style={{marginTop: '-30px'}}>

      <div className="filtralead">
        <div className="wrapperwrapper">
        <div className="filter-item">
          <Popover
            content={
              <div>
                <DatePicker
                  value={startDate ? moment(startDate) : null}
                  onChange={handleStartDateChange}
                  format="YYYY-MM-DD"
                  placeholder="Da"
                />
                <DatePicker
                  value={endDate ? moment(endDate) : null}
                  onChange={handleEndDateChange}
                  format="YYYY-MM-DD"
                  placeholder="A"
                />
              </div>
            }
            title="Seleziona intervallo di date"
            trigger="click"
          >
            <div className="data-selezionata" style={{ border: '1px solid #d9d9d9', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              {startDate && endDate ? (
                <div>
                  <span>{`${moment(startDate).format('ddd DD MMM')} - ${moment(endDate).format('ddd DD MMM')}`}</span>
                  <img src={cancel} onClick={handleClearDate} />
                </div>
              ) : (
                <span>Seleziona date</span>
              )}
            </div>
          </Popover>
        </div>

          {state.user.role && state.user.role === "orientatore" ?
           null :
           <div className="filter-item">
           <Popover
             content={
               <Select
                 value={selectedOrientatore}
                 style={{ width: 200 }}
                 onChange={handleOrientatoreChange}
                 placeholder="Nome orientatore"
               >
                 <Option value="">Tutti</Option>
                 {orientatoriOptions.map((option) => (
                   <Option key={option._id} value={option._id}>
                     {option.nome} {option.cognome}
                   </Option>
                 ))}
                 <Option value="nonassegnato">Non assegnato</Option>
               </Select>
             }
             title="Seleziona orientatore"
             trigger="click"
           >
             <div className="data-selezionata" style={{ border: '1px solid #d9d9d9', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
               {selectedOrientatore ? (
                <div>
                  {orientatoriOptions.find(option => option._id === selectedOrientatore)?.nome + ' ' + orientatoriOptions.find(option => option._id === selectedOrientatore)?.cognome}
                  <img src={cancel} onClick={handleClearOri} />
                </div>
               ) : (
                 <span>Seleziona orientatore</span>
               )}
             </div>
           </Popover>
         </div>}
          <div className="filtra-recall">
            <Switch
              checked={recallFilter}
              className="custom-switch"
              onChange={(checked) => {
                setRecallFilter(checked);
                if (checked) {
                  localStorage.setItem("recallFilter", "true");
                } else {
                  setFilteredData(originalData);
                  localStorage.removeItem('recallFilter');
                }
              }}
            />
            <span className="switch-label">Recall</span>
          </div>
          {/*<button onClick={handleClearFilter} className="button-filter rimuovi-button">Rimuovi filtri</button>*/}
        </div>
        <div className="leadslinks secondLink">
              <button id="visualbtt" onClick={handletogglegrid} className="">
                <img src={listaImg} />
                {toggleGrid ?
                  "Visualizza griglia"
                  :
                  "Visualizza lista"
                }
              </button>
              <button onClick={handleOpenAddPopup}>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                <span>
                  Aggiungi lead
                </span>
              </button>
          </div>
      </div>

      {changeOrientatore &&
              <div className="popup-container">
              <div className="popup" id="filterbyesito" onClick={(e) => e.stopPropagation()}>
                <div className='popup-top'>
                  <h4>Seleziona l'orientatore</h4>
                </div>
                <svg id="modalclosingicon" onClick={() => setChangeOrientatore(false)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                <div className="labelwrapper" onClick={(e) => e.stopPropagation()} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px'}}>
                  <Select
                      required
                      value={selectedOrientatoreToChange || "Seleziona un orientatore"}
                      onChange={(value) => setSelectedOrientatoreToChange(value)}
                      style={{ width: 200 }}
                      placeholder="Seleziona un orientatore"
                    >
                      <Option value="" disabled>Seleziona un orientatore</Option>
                      {orientatoriOptions && orientatoriOptions.map((option) => (
                        <Option key={option._id} value={option._id}>
                          {option.nome} {option.cognome}
                        </Option>
                      ))}
                  </Select>
                </div>
                <button className="btn-orie" style={{ fontSize: "16px" }} onClick={updateOrientatore}>Modifica</button>
              </div>
            </div>
      }
        {addOpen && 
        <div className="popup-container">
          <AddLeadPopup
          setAddOpen={setAddOpen} popupRef={popupRef} fetchLeads={() => {
            if (state.user.role && state.user.role === "orientatore"){
              getOrientatoreLeads();
            } else{
              fetchLeads(orientatoriOptions);
            }
            setRefreshate(true)
          }}
          />
         </div>}
      <Suspense fallback={<div>Loading...</div>}>
        {popupMotivi && (
          <div className="shadow-popup">
            <PopupMotivo
              type={typeMotivo}
              onClose={() => setPopupMotivi(false)}
              spostaLead={updateLeadEsitoConMotivo}
              leadId={leadIdMotivo}
            />
          </div>
        )}
      </Suspense>

      {deleting && (
        <div className='shadow-blur'>
        <div className="add-lead-popup" id="popupdeletelead" ref={popupRef}>
          <div className="popup-top">
            <h4>Eliminazione Lead</h4>
          </div>

          <svg id="modalclosingicon" onClick={() => { setDeleting(false); SETheaderIndex(999) }} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

          <p>Sei sicuro di voler eliminare il lead {selectedLead.name}?</p>

          <button className='btn-orie' onClick={handleDelete}>Elimina</button>
          <div style={{ cursor: "pointer", textAlign: "center" }} onClick={() => { setDeleting(false); SETheaderIndex(999) }}><u>Torna indietro</u></div>
        </div>
        </div>
      )}


      {popupModifyEsito && (
        <div className='popup-container'>
                         <div style={{marginTop: '100px'}} className="choose-esito-popup popup-esito3">
                         <div className='top-choose-esito'>
                         <h4>Modifica l'esito di {selectedLead.name}</h4>
                         </div>

                         <svg id="modalclosingicon-popup" onClick={() => { setPopupModifyEsito(false)}} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                              <div className='esiti-option-div' style={{ display: 'flex', justifyContent: 'center', overflowY: 'scroll' }}>
                                 <div className={esito === "Da contattare" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Da contattare')}>
                                     <span><span>o</span></span>
                                     Da contattare
                                 </div>
                                 <div className={esito === "Da richiamare" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Da richiamare')}>
                                     <span><span>o</span></span>
                                     Da richiamare
                                 </div>
                                 <div className={esito === "Non interessato" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Non interessato')}>
                                     <span><span>o</span></span>
                                     Lead persa
                                     {esito === "Non interessato" && (
                                         <select className="selectMotivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                                         <option value='' disabled>Seleziona motivo</option>
                                         {motivoLeadPersaList.map((motivoOption, index) => (
                                             <option key={index} value={motivoOption}>{motivoOption}</option>
                                         ))}
                                         </select>
                                     )}
                                 </div>
                                 <div className={esito === "Opportunità" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Opportunità')}>
                                     <span><span>o</span></span>
                                     Opportunità
                                 </div>
                                 <div className={esito === "Venduto" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Venduto')}>
                                     <span><span>o</span></span>
                                     Venduto
                                 </div>
                             </div>
                         <button style={{ fontSize: "14px" }} className='btn-orie' onClick={updateLeadEsito}>Salva modifiche</button>
                         </div>
                         </div>
      )
      }
      {toggleGrid ?
        <div style={{ borderRadius: '2px', padding: '30px 20px', maxHeight: '68vh',  }} className="table-big-container">
          <div className="table-filters">
            <div id="wrapperleadsright">
              <div className="filter-etichette">
                <Select
                  value={esitoToFilter || "Seleziona esito"}
                  onChange={cambiaEsito}
                  style={{ width: 200, fontSize: '16px' }}
                >
                  <Option value='' disabled>{esitoToFilter ? esitoToFilter : "Seleziona esito"}</Option>
                  <Option value="Nessun filtro">Nessun filtro</Option>
                  <Option value='Da contattare'>Da contattare</Option>
                  <Option value="Da richiamare">Da richiamare</Option>
                  <Option value='Non interessato'>Lead persa</Option>
                  <Option value="Opportunità">Opportunità</Option>
                  <Option value='Venduto'>Venduto</Option>
                </Select>
              </div>
            </div>
          </div>

          <div id="oftable">
            <table aria-label="simple table" className="table-container">
              <thead style={{ zIndex: '5', width: '100%' }}>
                <tr>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}>Nome</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}>Data e ora</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}>Telefono</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}>Esito</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}>Orientatore</th>
                  <th style={{ color: 'rgba(0, 0, 0, 0.31)', fontSize: '20px', fontWeight: "600" }}></th>
                </tr>
              </thead>
            
              <tbody style={{ color: "white", textAlign: 'left', padding: '0 20px' }} className="table-body-container" id="table2lista">
                {filteredData && filteredData
                  .filter(r =>
                    r.name.toLowerCase().includes(searchval.toLowerCase()) ||
                    r.telephone.toLowerCase().includes(searchval.toLowerCase())
                  )
                  .filter(r => (esitoToFilter && esitoToFilter !== undefined ? r.status === esitoToFilter : true))
                  .sort((a, b) => new Date(a.date) < new Date(b.date) ? 1 : -1)
                  .map((row) => (
                    <tr className={row.campagna === "Mgm" ? "mgm-lead" : ""} style={{position:'relative', padding: '0 20px'}} key={row.id}>
                      <td className="row-name" onClick={() => handleModifyPopup(row)}>
                        {row.name}
                      </td>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.telephone}</td>
                      <td>
                      {row.status == "Non interessato" ? "Lead persa" : row.status}
                        <span
                          className={"status " + row.status}
                          onClick={() => handleModifyPopupEsito(row)}
                        >
                          Modifica
                        </span>
                      </td>
                      <td style={{cursor: 'pointer'}} className="Details">{row.orientatore ? row.orientatore : "Non assegnato"} <span onClick={state.user.role && state.user.role === "orientatore" ? null : () => openChangeOrientatore(row)}>Modifica</span></td>
                      <td><img src={cestinonero} onClick={() => handleRowClick(row)}/></td>
                    </tr>
                  ))}
              </tbody>


            </table>
          </div>
        </div>

        :

        <div className="sectionswrapper"
          ref={secref}
        >
          <div className="secwrap"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Da contattare")}
            onDragEnd={handleDragEnd}
          >
            <LeadHeader
              handleModifyPopupEsito={(r) => handleModifyPopupEsito(r)}
              type={"Da contattare"}
              refreshate={false}
              toggles={toggles} SETtoggles={SETtoggles} filteredData={filteredData} />
            <div className="entries">
              {toggles.dacontattare && filteredData && filteredData.filter(x => x.status == "Da contattare").reverse().map((row, k) =>
                <LeadEntry
                  id={JSON.stringify(row)}
                  index={k}
                  handleRowClick={handleRowClick} data={row}
                  handleModifyPopup={handleModifyPopup}
                  secref={secref}
                  handleModifyPopupEsito={handleModifyPopupEsito}
                  handleDelete={handleDelete}
                  campagna={row.campagna}
                  nuovaEtichetta={nuovaEtichetta}
                  setNuovaEtichetta={setNuovaEtichetta}
                  selezionOrientatore={openChangeOrientatore}
                />
              )}
            </div>
          </div>
          <div className="secwrap"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Da richiamare")}
            onDragEnd={handleDragEnd}
          >
            <LeadHeader
              handleModifyPopupEsito={(r) => handleModifyPopupEsito(r)}
              type={"Da richiamare"}
              refreshate={false}
              toggles={toggles} SETtoggles={SETtoggles} filteredData={filteredData} />
            <div className="entries">
              {toggles.irraggiungibile && filteredData && filteredData.filter(x => x.status == "Da richiamare").reverse().map((row, k) =>
                <LeadEntry
                  id={JSON.stringify(row)}
                  index={k}
                  handleRowClick={handleRowClick} data={row}
                  handleModifyPopup={handleModifyPopup}
                  secref={secref}
                  handleModifyPopupEsito={handleModifyPopupEsito}
                  handleDelete={handleDelete}
                  campagna={row.campagna}
                  nuovaEtichetta={nuovaEtichetta}
                  setNuovaEtichetta={setNuovaEtichetta}
                  selezionOrientatore={openChangeOrientatore}
                />
              )}
            </div>
          </div>
          <div className="secwrap"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Non interessato")}
            onDragEnd={handleDragEnd}
          >
            <LeadHeader
              handleModifyPopupEsito={(r) => handleModifyPopupEsito(r)}
              type={"Lead persa"}
              getOtherLeads={getOtherLeads}
              getOtherLeadsOri={getOtherLeadsOri}
              refreshate={refreshate}
              toggles={toggles} SETtoggles={SETtoggles} filteredData={filteredData} />
            <div className="entries">
              {toggles.noninteressato && filteredData && filteredData.filter(x => x.status == "Non interessato").reverse().map((row, k) =>
                <LeadEntry
                  id={JSON.stringify(row)}
                  index={k}
                  handleRowClick={handleRowClick} data={row}
                  handleModifyPopup={handleModifyPopup}
                  secref={secref}
                  handleModifyPopupEsito={handleModifyPopupEsito}
                  handleDelete={handleDelete}
                  campagna={row.campagna}
                  nuovaEtichetta={nuovaEtichetta}
                  setNuovaEtichetta={setNuovaEtichetta}
                  selezionOrientatore={openChangeOrientatore}
                />
              )}
            </div>
          </div>
          <div className="secwrap"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Opportunità")}
            onDragEnd={handleDragEnd}
          >
            <LeadHeader
              handleModifyPopupEsito={(r) => handleModifyPopupEsito(r)}
              type={"Opportunità"}
              refreshate={false}
              toggles={toggles} SETtoggles={SETtoggles} filteredData={filteredData} />
            <div className="entries">
              {toggles.opportunita && filteredData && filteredData.filter(x => x.status == "Opportunità")
              .reverse()
              .sort((a, b) => parseInt(a.tentativiChiamata) - parseInt(b.tentativiChiamata))
              .map((row, k) =>
                <LeadEntry
                  id={JSON.stringify(row)}
                  index={k}
                  handleRowClick={handleRowClick} data={row}
                  handleModifyPopup={handleModifyPopup}
                  secref={secref}
                  handleModifyPopupEsito={handleModifyPopupEsito}
                  handleDelete={handleDelete}
                  campagna={row.campagna}
                  nuovaEtichetta={nuovaEtichetta}
                  setNuovaEtichetta={setNuovaEtichetta}
                  selezionOrientatore={openChangeOrientatore}
                />
              )}
            </div>
          </div>
          <div className="secwrap"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "Venduto")}
            onDragEnd={handleDragEnd}
          >
            <LeadHeader
              handleModifyPopupEsito={(r) => handleModifyPopupEsito(r)}
              type={"Venduto"}
              refreshate={false}
              toggles={toggles} SETtoggles={SETtoggles} filteredData={filteredData} />
            <div className="entries">
              {toggles.venduto && filteredData && filteredData.filter(x => x.status == "Venduto").reverse().map((row, k) =>
                <LeadEntry
                  id={JSON.stringify(row)}
                  index={k}
                  handleRowClick={handleRowClick} data={row}
                  handleModifyPopup={handleModifyPopup}
                  secref={secref}
                  handleModifyPopupEsito={handleModifyPopupEsito}
                  handleDelete={handleDelete}
                  campagna={row.campagna}
                  nuovaEtichetta={nuovaEtichetta}
                  setNuovaEtichetta={setNuovaEtichetta}
                  selezionOrientatore={openChangeOrientatore}
                />
              )}
            </div>
          </div>
        </div>
      }
    </div>
    </>
  );
}
