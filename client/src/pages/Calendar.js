import React, { useContext, useEffect, useState, useRef } from 'react';
import './calendar.css';
import axios from 'axios';
import { UserContext } from '../context';
import moment from 'moment';
import 'moment/locale/it';
import '../components/Table/Table2.scss'
import { Calendar, formatDate } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import cancel from '../imgs/cancel.png';
import timeGridPlugin from '@fullcalendar/timegrid'
import itLocale from '@fullcalendar/core/locales/it';
import { SearchOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import PopupModifyCalendar from '../components/Table/popupModify/PopupModifyCalendar';
import { DatePicker, Popover, Select, Switch } from 'antd';
import Logout from '../components/Logout';

const {Option} = Select
function MyCalendar({leads, setSelectedLead, setOpenInfoCal, saveNewRecall, setOpenDeleteRecall}) {
  const calendarRef = useRef(null);
  console.log(leads);
  const initialView = localStorage.getItem('calendarioVisualizzazione') || 'timeGridWeek';
  const formatDateString = (inputDate) => {
    const parsedDate = moment(inputDate, 'YY-MM-DD HH:mm');
    const formattedDate = parsedDate.format('DD-MM-YYYY HH:mm');
    return formattedDate;
  };
  useEffect(() => {
    const calendarEl = calendarRef.current;

    const calendar = new Calendar(calendarEl, {
      plugins:[dayGridPlugin, timeGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      initialView: initialView,
      editable: true,
      locale: itLocale,
      slotMinTime: '06:00:00', 
      slotMaxTime: '24:00:00',
      events: leads,
      eventContent: function (arg, createElement) {
        var titleText = arg.event.title;
        var descriptionText = (arg.event.extendedProps.appDate && arg.event.extendedProps.appDate.trim() !== "") && !arg.event.extendedProps.doppio ? formatDateString(arg.event.extendedProps.appDate) : arg.event.extendedProps.recallHours;
        
        return createElement(
          'div',
          {
            class: (arg.event.extendedProps.appDate && arg.event.extendedProps.appDate.trim() !== "") && !arg.event.extendedProps.doppio ? 'event-content-container chatbot-calendar' : 'event-content-container',
          },
          //createElement('span', {class: 'iniziali-icon-calendar'}, iniziali),
          createElement('span', { class: 'event-title' }, titleText),
          createElement('span', { class: 'event-description' }, descriptionText),
          createElement(
            'span',
            {
              class: 'close-icon-calendar',
              onclick: function () {
                setOpenDeleteRecall(true);
                setSelectedLead(arg.event.extendedProps);
                setOpenInfoCal(false);
              },
            },
            'X'
          ),
          );
      },
      eventClick: function(info) {
        setOpenInfoCal(true);
        console.log(info.event);
        setSelectedLead(info.event._def.extendedProps);
      },
      eventDrop: function (info) {
        const newStartDate = info.event.start;
      
        const formattedDate = moment(newStartDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        const formattedTime = moment(newStartDate).format('HH:mm');
      
        console.log('Data formattata:', formattedDate);
        console.log('Orario formattato:', formattedTime);
      
        saveNewRecall(info.event.id, formattedDate, formattedTime);
      },
      viewDidMount: function (info) {
        localStorage.setItem('calendarioVisualizzazione', info.view.type);
      },
    });

    calendar.render();

    return () => {
      calendar.destroy();
    };
  }, [leads]);

  return <div className='my-calendar' ref={calendarRef}></div>;
}

const CalendarM = () => {
    const [state] = useContext(UserContext);
    const [orientatoriOptions, setOrientatoriOptions] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [recallFilter, setRecallFilter] = useState(false);

    const formatDateString = (inputDate) => {
      let parsedDate;
      
      if (moment(inputDate, 'DD-MM-YYYY HH:mm', true).isValid()) {
        parsedDate = moment(inputDate, 'DD-MM-YYYY HH:mm');
      } else if (moment(inputDate, 'YY-MM-DD HH:mm', true).isValid()) {
        parsedDate = moment(inputDate, 'YY-MM-DD HH:mm');
      } else {
        throw new Error('Formato data non valido');
      }
    
      const formattedDate = parsedDate.format('DD/MM/YYYY HH:mm');
      const data = moment(formattedDate, 'DD/MM/YYYY HH:mm').toDate();
      return data;
    };
    
    const fetchLeads = async (orin) => {

        try {
          const response = await axios.post('/get-leads-manual-base', {
            _id: state.user._id
            //_id: "655f707143a59f06d5d4dc3b"
          });
    
          const doppioAppuntamento = response.data.filter(lead => (lead.appDate && lead.appDate !== "") && lead.recallDate);
          const filteredDoppione = doppioAppuntamento.map((lead) => {
            const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
            const cleanedTelephone =
              telephone.startsWith('+39') && telephone.length === 13
                ? telephone.substring(3)
                : telephone;
    
          const dateTime = moment(`${lead.recallDate} ${lead.recallHours}`, 'YYYY-MM-DD HH:mm:ss').toDate()
          const inizialiNome = lead.orientatori ? lead.orientatori.nome.charAt(0).toUpperCase() : '';
          const inizialiCognome = lead.orientatori ? lead.orientatori.cognome.charAt(0).toUpperCase() : '';

            return {
              id: lead._id,
              title: lead.nome + ' ' + lead.cognome,
              extendedProps : {
                name: lead.nome,
                surname: lead.cognome,
                email: lead.email,
                date: lead.data,
                telephone: cleanedTelephone,
                status: lead.esito,
                doppio: true,
                orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
                fatturato: lead.fatturato ? lead.fatturato : '',
                provenienza: lead.campagna,
                città: lead.città ? lead.città : '',
                trattamento: lead.trattamento ? lead.trattamento : '',
                note: lead.note ? lead.note : '',
                id: lead._id,
                etichette: lead.etichette ? lead.etichette : null,
                motivo: lead.motivo ? lead.motivo : null,
                recallHours: lead.recallHours ? lead.recallHours : null,
                recallDate: lead.recallDate ? lead.recallDate : null,
                lastModify: lead.lastModify ? lead.lastModify : null, 
                campagna: lead.utmCampaign ? lead.utmCampaign : "",
                tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "",
                summary: lead.summary ? lead.summary : "",
                appDate: lead.appDate ? lead.appDate : "",
                linkChat: lead.linkChat ? lead.linkChat : "",
            },
              start: dateTime,
              description: `Data: ${dateTime}, Testo`,
            };
          });
          const filteredTableLead = response.data.map((lead) => {
            const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
            const cleanedTelephone =
              telephone.startsWith('+39') && telephone.length === 13
                ? telephone.substring(3)
                : telephone;
    
          const inizialiNome = lead.orientatori ? lead.orientatori.nome.charAt(0).toUpperCase() : '';
          const dateTime = (lead.campagna === "AI chatbot" || (lead.appDate && lead.appDate?.trim()  !== '')) ?
          formatDateString(lead.appDate) :
          moment(`${lead.recallDate} ${lead.recallHours}`, 'YYYY-MM-DD HH:mm:ss').toDate();
            return {
              id: lead._id,
              title: lead.nome + ' ' + lead.cognome,
              extendedProps : {
                name: lead.nome,
                surname: lead.cognome,
                email: lead.email,
                date: lead.data,
                telephone: cleanedTelephone,
                status: lead.esito,
                doppio: false,
                orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
                fatturato: lead.fatturato ? lead.fatturato : '',
                provenienza: lead.campagna,
                città: lead.città ? lead.città : '',
                trattamento: lead.trattamento ? lead.trattamento : '',
                note: lead.note ? lead.note : '',
                id: lead._id,
                etichette: lead.etichette ? lead.etichette : null,
                motivo: lead.motivo ? lead.motivo : null,
                recallHours: lead.recallHours ? lead.recallHours : null,
                recallDate: lead.recallDate ? lead.recallDate : null,
                lastModify: lead.lastModify ? lead.lastModify : null, 
                campagna: lead.utmCampaign ? lead.utmCampaign : "",
                tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "",
                summary: lead.summary ? lead.summary : "",
                appDate: lead.appDate ? lead.appDate : "",
                linkChat: lead.linkChat ? lead.linkChat : "",
            },
              start: dateTime,
              description: `Data: ${dateTime}, Testo`,
            };
          });
          console.log(filteredTableLead)
          const mergedArray = filteredTableLead.concat(filteredDoppione);
          console.log(mergedArray)
          const ori = localStorage.getItem("Ori");

          const filteredByRecall = mergedArray.filter((lead) => {
            return (lead.extendedProps.recallDate && lead.extendedProps.recallHours && lead.extendedProps.recallDate !== null) || (lead.extendedProps.appDate);
          });
    
          const filteredByOrientatore = filteredByRecall.filter((row) => {
            if (ori && ori !== null && ori !== undefined && orin.length > 0) {
              const selectedOrientatoreObj = orin.find(option => option._id === ori);
              const selectedOrientatoreFullName = selectedOrientatoreObj ? selectedOrientatoreObj.nome + ' ' + selectedOrientatoreObj.cognome : '';
              const rowOrientatoreFullName = row.extendedProps.orientatore;
              return rowOrientatoreFullName === selectedOrientatoreFullName;
            } else if (ori === "nonassegnato") {
              const rowOrientatoreFullName = row.extendedProps.orientatore;
              return rowOrientatoreFullName === "";
            } else {
              return true;
            }
          });

          setFilteredData(filteredByOrientatore);
          setOriginalData(filteredByRecall);
          console.log(filteredByOrientatore);
          setIsLoading(false);
        } catch (error) {
          console.error(error.message);
        }
      };

      const getOrientatoreLeads = async () => {
        try {
          const response = await axios.post('/get-orientatore-lead-base', {
            _id: state.user._id
          });
    
          const doppioAppuntamento = response.data.filter(lead => (lead.appDate && lead.appDate !== "") && lead.recallDate);
          const filteredDoppione = doppioAppuntamento.map((lead) => {
            const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
            const cleanedTelephone =
              telephone.startsWith('+39') && telephone.length === 13
                ? telephone.substring(3)
                : telephone;
    
          const dateTime = moment(`${lead.recallDate} ${lead.recallHours}`, 'YYYY-MM-DD HH:mm:ss').toDate()
          const inizialiNome = lead.orientatori ? lead.orientatori.nome.charAt(0).toUpperCase() : '';
          const inizialiCognome = lead.orientatori ? lead.orientatori.cognome.charAt(0).toUpperCase() : '';

            return {
              id: lead._id,
              title: lead.nome + ' ' + lead.cognome,
              extendedProps : {
                name: lead.nome,
                surname: lead.cognome,
                email: lead.email,
                date: lead.data,
                doppio: true,
                telephone: cleanedTelephone,
                status: lead.esito,
                orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
                fatturato: lead.fatturato ? lead.fatturato : '',
                provenienza: lead.campagna,
                città: lead.città ? lead.città : '',
                trattamento: lead.trattamento ? lead.trattamento : '',
                note: lead.note ? lead.note : '',
                id: lead._id,
                etichette: lead.etichette ? lead.etichette : null,
                motivo: lead.motivo ? lead.motivo : null,
                recallHours: lead.recallHours ? lead.recallHours : null,
                recallDate: lead.recallDate ? lead.recallDate : null,
                lastModify: lead.lastModify ? lead.lastModify : null, 
                campagna: lead.utmCampaign ? lead.utmCampaign : "",
                tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "",
                summary: lead.summary ? lead.summary : "",
                appDate: lead.appDate ? lead.appDate : "",
                linkChat: lead.linkChat ? lead.linkChat : "",
            },
              start: dateTime,
              description: `Data: ${dateTime}, Testo`,
            };
          });
          const filteredTableLead = response.data.map((lead) => {
            const telephone = lead.numeroTelefono ? lead.numeroTelefono.toString() : '';
            const cleanedTelephone =
              telephone.startsWith('+39') && telephone.length === 13
                ? telephone.substring(3)
                : telephone;

                const dateTime = (lead.campagna === "AI chatbot" || (lead.appDate && lead.appDate?.trim()  !== '')) ?
                formatDateString(lead.appDate) :
                moment(`${lead.recallDate} ${lead.recallHours}`, 'YYYY-MM-DD HH:mm:ss').toDate();
              console.log(dateTime)
            return {
              id: lead._id,
              title: lead.nome + ' ' + lead.cognome,
              extendedProps: {
                name: lead.nome,
                surname: lead.cognome,
                email: lead.email,
                date: lead.data,
                telephone: cleanedTelephone,
                status: lead.esito,
                doppio: false,
                orientatore: lead.orientatori ? lead.orientatori.nome + ' ' + lead.orientatori.cognome : '',
                fatturato: lead.fatturato ? lead.fatturato : '',
                provenienza: lead.campagna,
                città: lead.città ? lead.città : '',
                trattamento: lead.trattamento ? lead.trattamento : '',
                note: lead.note ? lead.note : '',
                id: lead._id,
                etichette: lead.etichette ? lead.etichette : null,
                motivo: lead.motivo ? lead.motivo : null,
                recallHours: lead.recallHours ? lead.recallHours : null,
                recallDate: lead.recallDate ? lead.recallDate : null,
                lastModify: lead.lastModify ? lead.lastModify : null, 
                campagna: lead.utmCampaign ? lead.utmCampaign : "",
                tentativiChiamata: lead.tentativiChiamata ? lead.tentativiChiamata : "",
                summary: lead.summary ? lead.summary : "",
                appDate: lead.appDate ? lead.appDate : "",
                linkChat: lead.linkChat ? lead.linkChat : "",
              },
              start: dateTime,
              description: `Data: ${dateTime}, Testo`,
            };
          });
    
          const mergedArray = filteredTableLead.concat(filteredDoppione);
          const recall = localStorage.getItem("recallFilter");
    
          const filteredByRecall = mergedArray.filter((lead) => {
            if (lead.recallDate && recall && recall === "true") {
              const recallDate = new Date(lead.recallDate);
              const today = new Date();
              return recallDate <= today;
            } else if (recall === false || recall == undefined || !recall) {
              return true;
            }
            return false;
          });
    
          setFilteredData(filteredByRecall);
          setIsLoading(false);
          setOriginalData(filteredTableLead);
        } catch (error) {
          console.error(error.message);
        }
      }

      const getOrientatori = async () => {
        await axios.get(`/utenti/${state.user._id}/orientatori`)
          .then(response => {
            const data = response.data.orientatori;
  
            setOrientatoriOptions(data);
            fetchLeads(data);
          })
          .catch(error => {
            console.error(error);
          });
      }

      useEffect(() => {
        if (state.user.role && state.user.role === "orientatore"){
          getOrientatoreLeads();
        } else {
          getOrientatori();
        }
        const ori = localStorage.getItem("Ori");
        if (ori && ori !== null && ori !== undefined && ori !== "") {
          setSelectedOrientatore(ori);
        }
      }, []);

      const [isLoading, setIsLoading] = useState(true);
      const [openInfoCal, setOpenInfoCal] = useState(false);
      const [selectedLead, setSelectedLead] = useState(null);
      const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
      const [selectedOrientatore, setSelectedOrientatore] = useState("");
      const [openDeleteRecall, setOpenDeleteRecall] = useState(false);

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

      const saveNewRecall = async (leadId, recallDate, recallHours) => {
        console.log(leadId, recallDate, recallHours)
        try {
          const response = await axios.post('/update-lead-recall', {
            leadId,
            recallDate,
            recallHours,
          });
      
          console.log('Lead aggiornata:', response.data);
          if (state.user.role && state.user.role === "orientatore"){
            getOrientatoreLeads();
          } else {
            fetchLeads(orientatoriOptions);
          }
          toast.success('Recall Modificata!');

          const updatedLeads = [...filteredData]; // Crea una copia dell'array
          const leadIndex = updatedLeads.findIndex(lead => lead.id === leadId);
      
          if (leadIndex !== -1) {
            updatedLeads[leadIndex] = {
              ...updatedLeads[leadIndex],
              extendedProps: {
                ...updatedLeads[leadIndex].extendedProps,
                recallDate: response.data.recallDate,
                recallHours: response.data.recallHours,
              },
              start: moment(`${response.data.recallDate} ${response.data.recallHours}`, 'YYYY-MM-DD HH:mm:ss').toDate(),
            };
      
            setFilteredData(updatedLeads);
          } 
        } catch (error) {
          console.error('Errore durante l\'aggiornamento della lead:', error.message);
        }
      };

      const [filtroDiRiserva, setFiltroDiRiserva] = useState([]);

      const handleUpdateLead = (updatedLead) => {
        setSelectedLead(updatedLead);
      };

      const deleteRecall = async () => {
        const recallDate = null;
        const recallHours = null;
        try {
          const response = await axios.post('/delete-recall', {
            leadId: selectedLead.id,
          });
      
          if (response.status === 200) {
            console.log('Recall eliminata con successo');
            toast.success('Recall eliminata');
            if (state.user.role && state.user.role === "orientatore"){
              getOrientatoreLeads();
            } else {
              fetchLeads();
            }
            setOpenDeleteRecall(false);
            setOpenInfoCal(false);
            const updatedLeads = [...filteredData];
            const leadIndex = updatedLeads.findIndex(lead => lead.id === selectedLead.id);
      
            if (leadIndex !== -1) {
              updatedLeads = updatedLeads.filter((lead, index) => index !== leadIndex);
              setFilteredData(updatedLeads);
            }
        }
          else {
            console.error('Errore durante l\'eliminazione della recall');
          }
        } catch (error) {
          console.error('Errore durante la richiesta:', error.message);
        }
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

    return (
    <>
          {openInfoCal && selectedLead &&
          <div className="shadow-popup-modify">
            <PopupModifyCalendar
              onClose={() => {setOpenInfoCal(false); setSelectedLead(null)}}
              lead={selectedLead}
              onUpdateLead={handleUpdateLead}
              setPopupModify={() => {setOpenInfoCal(false); setSelectedLead(null)}}
              //popupRef={popupRef}
              fetchLeads={() => {
                if (state.user.role && state.user.role === "orientatore"){
                  getOrientatoreLeads()
                } else {
                  fetchLeads(orientatoriOptions)
                }
              }}
            />
            </div>
          }
        {openDeleteRecall && selectedLead && (
          <div className='delete-recall-popup popup-orientatore'>
            <h4>Vuoi cancellare l’appuntamento?</h4>
            <div>
              <button onClick={() => setOpenDeleteRecall(false)}>No</button>
              <button onClick={deleteRecall}>Si</button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div></div>
        ): (
            <div className='calenda-totaly'>
              <div className='Table-admin'>
                      <div className="filtralead filtralead-calendar">
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
                              <button>
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                                <span>
                                  Aggiungi call
                                </span>
                              </button>
                          </div>
                      </div>
                      </div>
                <div className='calendar-container-t'>
                {filteredData && filteredData.length > 0 ? (
                  <MyCalendar 
                  saveNewRecall={saveNewRecall} 
                  setPopupPosition={setPopupPosition} 
                  setOpenInfoCal={setOpenInfoCal} 
                  setSelectedLead={setSelectedLead} 
                  setOpenDeleteRecall={setOpenDeleteRecall}
                  leads={
                    filteredData.filter((row) => {
                      console.log(selectedOrientatore)
                      console.log(recallFilter)
                      console.log(startDate, endDate)
                      if (selectedOrientatore !== "" && selectedOrientatore !== undefined && selectedOrientatore !== null) {
                        const selectedOrientatoreObj = orientatoriOptions.find(option => option._id === selectedOrientatore);
                        const selectedOrientatoreFullName = selectedOrientatoreObj ? selectedOrientatoreObj.nome + ' ' + selectedOrientatoreObj.cognome : '';
                        const rowOrientatoreFullName = row.extendedProps.orientatore;
                        if (rowOrientatoreFullName !== selectedOrientatoreFullName) return false;
                      } else if (selectedOrientatore === "nonassegnato") {
                        const rowOrientatoreFullName = row.extendedProps.orientatore;
                        if (rowOrientatoreFullName !== "") return false;
                      }
          
                      // Filtro per recall
                      if (recallFilter) {
                        if (row.extendedProps.recallDate && row.extendedProps.recallHours) {
                          console.log(row.extendedProps.recallDate)
                          const recallDate = new Date(row.extendedProps.recallDate);
                          const today = new Date();
                          if (recallDate > today) return true;
                        } else {
                          return false;
                        }
                      }
          
                      // Filtro per data
                      if (startDate !== null && endDate !== null) {
                        const rowDate = Date.parse(row.extendedProps.date);
                        const selectedDateStart = new Date(startDate);
                        const selectedDateEnd = new Date(endDate);
                        selectedDateEnd.setDate(selectedDateEnd.getDate() + 1);
                        return rowDate >= selectedDateStart && rowDate <= selectedDateEnd;
                      }

                      return true;
                    })
                  }/>
                ) : (
                  <MyCalendar saveNewRecall={saveNewRecall} setPopupPosition={setPopupPosition} setOpenInfoCal={setOpenInfoCal} setSelectedLead={setSelectedLead} leads={filteredData && filteredData} />
                )}
                </div>
                <Logout />
            </div>  
        )} 
    </>
  )
}

export default CalendarM