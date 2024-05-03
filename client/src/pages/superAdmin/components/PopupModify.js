import React, { useContext, useState, useEffect } from 'react'
import '../../../components/Table/popupModify/popupModify.scss'
import { WhatsAppOutlined } from '@ant-design/icons';
import { FaPencilAlt, FaSave } from "react-icons/fa";
import { FiClock } from 'react-icons/fi';
import { UserContext } from '../../../context';
import '../homeSuper.css'
import axios from 'axios';
import toast from 'react-hot-toast';
import recallblue from '../../../imgs/recallblue.png';
import indietro from '../../../imgs/indietro.png';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import recallgreen from '../../../imgs/recallGren.png';
import moment from 'moment';

const PopupModify = ({ lead, onClose, setPopupModify, onUpdateLead, setRefreshate , admin = false, popupRef, fetchLeads, setInfoPopup}) => {
    const [state, setState] = useContext(UserContext);
    const leadId = lead.id;
    console.log(lead)
    const userId = state.user._id;
    const [email, setEmail] = useState(lead.email);
    const [campagna, setCampagna] = useState(lead.campagna ? lead.campagna : "");
    const [numeroTelefono, setNumeroTelefono] = useState(lead.telephone);
    const [orientatori, setOrientatori] = useState(lead.orientatore ? lead.orientatore : '');
    const [città, setCittà] = useState(lead.città ? lead.città.charAt(0).toUpperCase() + lead.città.slice(1) : '');
    const [note, setNote] = useState(lead.note ? lead.note : '');
    const [orientatoriOptions, setOrientatoriOptions] = useState([]);
    const [esito, setEsito] = useState(lead.status);
    const [trattamento, setTrattamento] = useState(lead.trattamento ? lead.trattamento.replace(/_/g, ' ') : "");
    const [fatturato, setFatturato] = useState(lead.fatturato ? lead.fatturato : '0');
    const [oraChiamataRichiesto, setOraChiamataRichiesto] = useState(lead.oraChiamataRichiesto ? lead.oraChiamataRichiesto : '');
    const [mostraCalendar, setMostraCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(lead.recallDate && lead.recallDate !== null ? new Date(lead.recallDate) : new Date());
    const [selectedTime, setSelectedTime] = useState({ hours: 7, minutes: 0 });
    const [patientType, setPatientType] = useState('');
    const [treatment, setTreatment] = useState('');
    const [location, setLocation] = useState('');
    const [tentativiChiamata, setTentativiChiamata] = useState(lead.tentativiChiamata ? lead.tentativiChiamata : "0");

    const [motivo, setMotivo] = useState(lead.motivo ? lead.motivo : "");
    const [motivoLeadPersaList, setMotivoLeadPersaList] = useState([
        "Numero Errato", "Non interessato", "Non ha mai risposto"
    ]);

    const userFixId = state.user.role && state.user.role === "orientatore" ? state.user.utente : state.user._id;
    function mapCampagnaPerLeadsystem(nomeCampagna) {
        if (nomeCampagna.includes('Gold')){
            return 'Gold';
        } else if (nomeCampagna.includes('Ambra')){
            return 'Ambra';
        } else if (nomeCampagna.includes('Altri centri')) {
          return 'Meta Web - Altri centri';
        } else if (nomeCampagna.includes('Meta Web')) {
            if (nomeCampagna === "Meta Web G"){
                return 'Meta Web G'
            } else return 'Meta Web';
        } else if (nomeCampagna.includes('Messenger') || nomeCampagna.includes("messenger")) {
          return 'Messenger';
        } else {
          return "Meta Web";
        }
      }

    const handleDateChange = (date) => {
      setSelectedDate(date);
    };

    useEffect(() => {
        if (lead.recallHours && lead.recallHours !== null) {
          const [hours, minutes] = lead.recallHours.split(':').map(Number);
          setSelectedTime({ hours, minutes });
        }
      }, [lead.recallHours]);

    const handleTimeChange = (e) => {
        const { name, value } = e.target;
        setSelectedTime((prevTime) => ({
          ...prevTime,
          [name]: parseInt(value, 10),
        }));
      };

      const handleSaveRecall = async () => {
        if (selectedDate && selectedTime) {
          const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
          const recallDate = localDate.toISOString().split('T')[0];
    
          const recallHours = `${selectedTime.hours}:${selectedTime.minutes < 10 ? `0${selectedTime.minutes}` : selectedTime.minutes}`;
    
          console.log('Recall Date:', recallDate);
          console.log('Recall Hours:', recallHours);
          try {
            const response = await axios.post('/update-lead-recall', {
              leadId,
              recallDate,
              recallHours,
            });
        
            console.log('Lead aggiornata:', response.data);
            fetchLeads();
            setRefreshate(true)
            toast.success('Recall aggiunta!');
            setMostraCalendar(false);
            onUpdateLead({
                ...lead,
                recallDate,
                recallHours,
            });
          } catch (error) {
            console.error('Errore durante l\'aggiornamento della lead:', error.message);
          }
        } else {
          console.error('Seleziona data e orario per salvare la recall');
          window.alert("Seleziona sia il giorno sia l'ora");
        }
      };

    const ChooseDate = () => {
        return(
            <div className='choose-date'>
                <div className='choose-date-top'>
                    <img onClick={() => setMostraCalendar(false)} src={indietro} className='indietro-image' />
                    <img src={recallblue} />
                    <h4>Organizza una recall</h4>
                    <p>Seleziona una data e una fascia oraria <br /> per organizzare una recall</p>
                </div>
                <hr className='linea-choose-date' />
                <div className='calendar-container'>
                    <Calendar 
                        onChange={(date) => {
                        handleDateChange(date);
                    }} 
                    className="custom-calendar" 
                    value={selectedDate} />                    
                </div>
                <hr className='linea-choose-date' />
                <div className='orario-container'>
                    <p>seleziona <br />un orario</p>
                    <div className='select-container-orario'>
                        <select 
                        className='select-box'
                        name="hours"
                        value={selectedTime.hours}
                        onChange={(e) => handleTimeChange(e)}>
                            {Array.from({ length: 15 }, (_, i) => {
                                const hour = i + 7; // Parte da 7 e aggiunge l'offset
                                return (
                                    <option key={hour} value={hour}>{hour < 10 ? `0${hour}` : hour}</option>
                                );
                            })}
                        </select>
                        <span className='separator'>:</span>
                        <select 
                        className='select-box'
                        name="minutes"
                        value={selectedTime.minutes}
                        onChange={(e) => handleTimeChange(e)}
                        >
                        {/* Opzioni per i minuti */}
                        {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>{i < 10 ? `0${i}` : i}</option>
                        ))}
                        </select>
                    </div>
                </div>
                <hr className='linea-choose-date' />
                <div className='button-choose-date'>
                    <button onClick={handleSaveRecall}>Salva recall</button>
                    <button onClick={() => setMostraCalendar(false)}>Indietro</button>
                </div>
            </div>
        )
    }

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

    const getStartTime = (timeString) => {
        return timeString.includes('_-_') ? timeString.split('_-_')[0] : timeString;
      };
    
      useEffect(() => {
        const startTime = getStartTime(oraChiamataRichiesto);
        setOraChiamataRichiesto(startTime);
      }, [setOraChiamataRichiesto]);


    useEffect(() => {
        const getOrientatori = async () => {
            await axios.get(`/utenti/${userFixId}/orientatori`)
                .then(response => {
                    const data = response.data.orientatori;

                    setOrientatoriOptions(data);
                    const orientatorePredefinito = data.find(option => {
                        const nomeCompleto = `${option.nome} ${option.cognome}`;
                        return nomeCompleto === lead.orientatore;
                      });
                      const orientatorePredefinitoId = orientatorePredefinito ? orientatorePredefinito._id : '';
                     setOrientatori(orientatorePredefinitoId); 
                })
                .catch(error => {
                    console.error(error);
                });
        }

        if (state && state.token) getOrientatori();
    }, [])

    const updateLead = async () => {
        if (esito === "Non valido" || esito === "Non interessato"){
            if (!motivo || motivo == ""){
              window.alert("Inserisci il motivo")
              return
            } else {
                try {
                    const modifyLead = {
                        email,
                        numeroTelefono,
                        orientatori,
                        note,
                        esito,
                        fatturato,
                        motivo,
                        città,
                        trattamento,
                        tentativiChiamata
                    };
                    const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
                    fetchLeads();
                    setRefreshate(true)
                    setPopupModify(false);
                    toast.success('Il lead è stato modificato con successo.')
                } catch (error) {
                    console.error(error);
                }            
            }
          } else {
            try {
                const modifyLead = {
                    email,
                    numeroTelefono,
                    orientatori,
                    note,
                    esito,
                    fatturato,
                    motivo: "",
                    città,
                    trattamento,
                    tentativiChiamata
                };
                const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
                fetchLeads();
                setPopupModify(false);
                setRefreshate(true)
                toast.success('Il lead è stato modificato con successo.')
            } catch (error) {
                console.error(error);
            }            
        }
    };

    const handleSaveName = async () => {
        const name = nome;
        const surname = cognome;
        try {
            const modifyLead = {
                nome,
                cognome,
            };
            const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
            onUpdateLead({
                ...lead,
                name,
                surname,
            });
            fetchLeads();
            setModificaNome(false);
            toast.success('Nome modificato!')
            setRefreshate(true)
        } catch (error) {
            console.error(error);
        }
    };

    const saveMotivoverify = async () => {
        if (esito === "Non valido" || esito === "Non interessato"){
            if (!motivo || motivo == ""){
              window.alert("Inserisci il motivo")
              return
            } else {
                try {
                    const modifyLead = {
                        esito,
                        fatturato,
                        motivo,
                      };   
                      const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
                      onUpdateLead({
                        ...lead,
                        status: esito,
                        motivo: motivo,
                        fatturato: fatturato
                    });
                        fetchLeads();
                        toast.success('Stato modificato!');
                        setRefreshate(true)
                        setChooseMotivo(false);
                } catch (error) {
                    console.error(error);
                }
            }
        } else if (esito === "Fissato"){
            if (treatment === "" || location === "" || patientType === ""){
                window.alert('Compila tutti i campi')
                return
            } else {
                try {
                    const modifyLead = {
                        esito,
                        fatturato,
                        tipo: patientType, 
                        trattPrenotato: treatment, 
                        luogo: location,
                      };   
                      const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
                      onUpdateLead({
                        ...lead,
                        status: esito,
                        motivo: motivo,
                        fatturato: fatturato
                    });
                        fetchLeads();
                        toast.success('Stato modificato!');
                        setRefreshate(true)
                        setChooseMotivo(false);
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            try {
            const motivo = "";
            const modifyLead = {
            esito,
            fatturato,
            motivo,
            };   
            const response = await axios.put(`/lead/${userFixId}/update/${leadId}`, modifyLead);
            onUpdateLead({
                ...lead,
                status: esito,
                motivo: motivo,
                fatturato: fatturato
            });
            fetchLeads();
            toast.success('Stato modificato!');
            setRefreshate(true)
            setChooseMotivo(false);
            } catch (error) {
              console.error(error);
            }
        }
    }

    const handleClickWhatsapp = () => {
        const whatsappLink = `https://wa.me/39${lead.telephone}`;
        window.open(whatsappLink, '_blank');
      };

      const formattedRecallDateTime = (recallDate, recallHours) => {
        const recallDateTime = moment(`${recallDate} ${recallHours}`, 'YYYY-MM-DD HH:mm');
        
        const formattedDate = recallDateTime.format('DD/MM/YY');
        const formattedTime = recallDateTime.format(' [alle ore] HH:mm');
      
        return `${formattedDate}${formattedTime}`;
      };

      const deleteRecall = async () => {
        const recallDate = null;
        const recallHours = null;
        try {
          const response = await axios.post('/delete-recall', {
            leadId: leadId,
          });
      
          if (response.status === 200) {
            console.log('Recall eliminata con successo');
            toast.success('Recall eliminata');
            onUpdateLead({
                ...lead,
                recallDate,
                recallHours,
            });
            fetchLeads();
            setRefreshate(true)
          } else {
            console.error('Errore durante l\'eliminazione della recall');
          }
        } catch (error) {
          console.error('Errore durante la richiesta:', error.message);
        }
      };

      const [modificaNome, setModificaNome] = useState(false);
      const [nome, setName] = useState(lead?.name);
      const [cognome, setSurname] = useState(lead?.surname);

      const [openPage, setOpenPage] = useState("scheda");
      const [chooseMotivo, setChooseMotivo] = useState(false);
      const [expanded, setExpanded] = useState(false);
      const MAX_CHARS = 100;
      const fullText = lead?.summary || "Nessuna analisi disponibile";
      const displayedText = expanded ? fullText : fullText.substring(0, MAX_CHARS) + (fullText.length > MAX_CHARS ? '...' : '');
      const formatDateString = (inputDate) => {
        const parsedDate = moment(inputDate, 'YY-MM-DD HH:mm');                
        const formattedDate = parsedDate.format('DD/MM/YYYY HH:mm');        
        return formattedDate;
      };
    return (
        <>
        {mostraCalendar ? (
            <div className='popup-modify pm-super' id={admin ? "popupadmincolors" : ''}>
               <ChooseDate /> 
            </div>
            ) : (
            <div className='popup-modify pm-super' id={admin ? "popupadmincolors" : ''}>
                {chooseMotivo && (
                    <div className='shadow-blur'>
                        <div style={{marginTop: '-100px', position: 'fixed', zIndex: 100}} className="choose-esito-popup">
                            <div className='top-choose-esito'>
                            <h4>Modifica l'esito di {nome + " " + cognome}</h4>
                            </div>

                            <svg id="modalclosingicon-popup" onClick={() => { setChooseMotivo(false)}} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                                 <div className='esiti-option-div' style={{ display: 'flex', justifyContent: 'center', overflowY: 'scroll' }}>
                                    <div className={esito === "Da contattare" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Da contattare')}>
                                        <span><span>o</span></span>
                                        Da contattare
                                    </div>
                                    <div className={esito === "Non risponde" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Non risponde')}>
                                        <span><span>o</span></span>
                                        Non risponde
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
                                    <div className={esito === "Venduto" ? "selected-option-motivo esito-option" : "esito-option"} onClick={() => setEsito('Venduto')}>
                                        <span><span>o</span></span>
                                        Venduto
                                    </div>
                                </div>
                            <button style={{ fontSize: "14px" }} className='btn-orie' onClick={saveMotivoverify}>Salva modifiche</button>
                            </div>
                    </div>
                )}
                <div className='popup-top'>
                   <div>           
                        <div>
                            <h4 className={openPage == "scheda" ? "page-scheda" : ""} onClick={() => setOpenPage("scheda")}>Scheda lead</h4>
                            <hr className={openPage == "scheda" ? "page-scheda-linea" : ""} />
                        </div>
                        {/*<div>
                           <h4 className={openPage == "info" ? "page-scheda" : ""} onClick={() => setOpenPage("info")}>Maggiori info</h4>
                           <hr className={openPage == "info" ? "page-scheda-linea" : ""} /> 
                         </div>*/}
                    </div>
                    <svg id="modalclosingicon-choose" onClick={onClose} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
                </div>
                <hr className='linea-che-serve2' />
                        <div className='popup-middle-top'>
                            <div className='popup-middle-top1'>
                                <div>
                                    {
                                    !modificaNome ? 
                                    <p>{lead.name} {lead.surname} <span onClick={() => setModificaNome(true)} className='span-nome'><FaPencilAlt size={14} style={{marginLeft: '10px'}} /></span></p>: 
                                    <p className='modifica-nome-input'>
                                        <input placeholder={lead.name} value={nome} onChange={(e) => setName(e.target.value)} />
                                        <input placeholder={lead.surname} value={cognome} onChange={(e) => setSurname(e.target.value)} />
                                        <FaSave size={30} className='salva-nome' onClick={handleSaveName} />
                                    </p>
                                    }
                                    <p><FiClock color='#30978B' /> Data di <b>creazione lead</b>: <span>{formatDate(lead.date)}</span></p>
                                    <p>{lead.lastModify && lead.lastModify !== null ? <><FiClock color='#3471CC' /> Data <b>ultima modifica</b>: <span>{formatDate(lead.lastModify)}</span></> : ""}</p>
                                    {(lead.provenienza === "AI chatbot" || (lead.appDate && lead?.appDate?.trim() !== "")) && lead.appDate && <p><FiClock color='#3471CC' /> Data <b>appuntamento:</b> <span>{formatDateString(lead.appDate)}</span></p>}
                                    <p style={{margin: '17px 0 10px 0'}}>Stato lead: 
                                        <span onClick={() => setChooseMotivo(true)}>{esito == "Non interessato" ? "Lead persa" : esito} <FaPencilAlt size={12} style={{marginLeft: '3px', cursor: 'pointer'}} /></span>
                                    </p>
                                    {motivo && motivo !== "" && lead.status === "Non interessato" ? <p className='motivo-top'>Motivo: <span>{motivo}</span></p> : null}
                                </div>
                            </div>
                            <div className='popup-middle-top2'>
                            <button className='btnWhats' onClick={handleClickWhatsapp}><WhatsAppOutlined /> Contatta su whatsapp</button>
                            {lead.recallDate && lead.recallHours && lead.recallDate !== null && lead.recallHours !== null ?
                            <button className='recallGreen'>
                                <img src={recallgreen} onClick={() => setMostraCalendar(true)} />
                                <span onClick={() => setMostraCalendar(true)}>
                                    Recall in data <br />
                                    {formattedRecallDateTime(lead.recallDate, lead.recallHours)}
                                </span>
                                <button className='delete-recall' onClick={deleteRecall}>x</button>
                            </button> : 
                            <button className='btcRecall' onClick={() => setMostraCalendar(true)}>
                                <img src={recallblue} />organizza una recall
                            </button>
                            }
                            </div>
                        </div>
                        <hr className='linea-che-serve' />
                        <div className='sommario'>
                           <h4>Sommario</h4>
                           <p>
                              {displayedText}
                                {fullText.length > MAX_CHARS && (
                                <span onClick={() => setExpanded(!expanded)}>
                                    {expanded ? 'Leggi meno' : 'Leggi di più'}
                                </span>
                                )}
                            </p> 
                        </div>
                        <hr className='linea-che-serve' />
                        <div className='maggiori-informazioni'>
                            <h4>ANAGRAFICA</h4>
                            <div className='mi-div'>
                                <div>
                                    <p>Telefono</p>
                                    <input placeholder={lead.telephone} disabled value={numeroTelefono} onChange={(e) => setNumeroTelefono(e.target.value)} />
                                </div>
                                <div>
                                    <p>Email</p>
                                    <input placeholder={lead.email} disabled value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className={lead.leadAmbassador ? 'mi-div mgm-div' : 'mi-div'}>
                                <div>
                                    <p>Campagna</p>
                                    <input placeholder={lead.campagna ? lead.campagna : ""} value={mapCampagnaPerLeadsystem(lead.campagna)} disabled onChange={(e) => setCampagna(e.target.value)} />
                                </div>
                                {state.user.role && state.user.role === "orientatore" ? 
                                <div>
                                    <p>Operatore</p>
                                    <label>
                                        <select 
                                        data-width="100%"
                                        disabled
                                        required value={orientatori} onChange={(e) => setOrientatori(e.target.value)}>
                                            <option value="" disabled defaultChecked>{lead.orientatori ? lead.orientatori : 'Seleziona orientatore'}</option>
                                            {orientatoriOptions.map((option) => (
                                                <option key={option._id} value={option._id}>
                                                    {option.nome} {' '} {option.cognome}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>: <div>
                                    <p>Operatore</p>
                                    <label>
                                        <select 
                                        data-width="100%"
                                        required value={orientatori} onChange={(e) => setOrientatori(e.target.value)}>
                                            <option value="" disabled defaultChecked>{lead.orientatori ? lead.orientatori : 'Seleziona orientatore'}</option>
                                            {orientatoriOptions.map((option) => (
                                                <option key={option._id} value={option._id}>
                                                    {option.nome} {' '} {option.cognome}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>}
                            </div>
                            <div className='mi-div'>
                                <div>
                                    <p>Città</p>
                                    <input disabled placeholder={lead?.città?.charAt(0).toUpperCase()} value={città} onChange={(e) => setCittà(e.target.value)} />
                                </div>
                                <div className='trat-cont-input'>
                                    <p>Campo aggiuntivo</p>
                                    <input className='input-trattamento-hover' disabled placeholder={lead?.trattamento?.replace(/_/g, ' ')} value={trattamento} onChange={(e) => setTrattamento(e.target.value)} />
                                    <span className="trattamento-fullname">{lead?.trattamento?.replace(/_/g, ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <hr className='linea-che-serve' />
                        <div className='popup-bottom maggiori-informazioni'>
                            <p style={{ fontSize: "18px", display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginBottom: '0px' }}>Inserisci <span style={{ color: "#3471CC", display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginLeft: '5px' }}>
                                note
                                </span></p>
                            <textarea
                                placeholder='Inserisci una nota...'
                                id='textareanote' value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>
                <div className='popup-bottom'>
                    <div className='popup-bottom-button'>
                        <a onClick={updateLead}>Salva scheda lead</a>
                    </div>                    
                </div>

            </div>                  
            )}
      
        </>

    )
}

export default PopupModify