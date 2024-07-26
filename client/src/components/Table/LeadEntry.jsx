import React, { useContext, useEffect, useState } from 'react'
import './LeadEntry.scss'
import recall from '../../imgs/recallGren.png';
import recGreen from '../../imgs/recPegGreen.png';
import recRed from '../../imgs/recPegRed.png';
import recYellow from '../../imgs/recPegYellow.png';
import drag from '../../imgs/drag.png'
import { FaCalendarAlt } from 'react-icons/fa';

// id: lead._id,
// name: lead.nome,
// surname: lead.cognome,
// email: lead.email,
// date: lead.data,
// telephone: cleanedTelephone,
// status: lead.esito,
// orientatore: lead.orientatori.nome,

export default function LeadEntry({ secref, id, index, data, handleModifyPopup, handleModifyPopupEsito, handleRowClick, campagna, etichette, selezionOrientatore }) {
  const iniziali = data.name?.charAt(0).toUpperCase() + data.surname?.charAt(0).toUpperCase();
  const ref = React.useRef(null);
  const [etichettaModify, setEtichettaModify] = useState(false);
  const [leadSel, setLeadSel] = useState(null);

  const handleDragStart = (event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ id: data }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    //handleModifyPopup(droppedItem.id);
  };

    
  const createDate = new Date(data?.date);
  const today = new Date();
  const daysSinceCreation = Math.floor((today - createDate) / (1000 * 60 * 60 * 24));
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const recallDate = new Date(data.recallDate);
  const normalizedRecallDate = new Date(recallDate.getFullYear(), recallDate.getMonth(), recallDate.getDate()).getTime();

  if (data)
    return (
      <div key={index} className={data.campagna === "Mgm" || data.campagna === "AI chatbot" || (data.appDate && data?.appDate?.trim() !== "") ? "leadentry" : "leadentry"}
        ref={ref}
        draggable="true"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="dis">
          <div className="top-bollettino">
            <p className='iniziali'>{iniziali}</p>
            <div className='centro-bollettino'>
              <p className='name'>{data.name + " " + data.surname}</p>
              <span className="modifica" onClick={() => handleModifyPopup(data)}>Info</span>
            </div>
            <div id="dragme">
              <img alt='dragme' src={drag} />
            </div>
          </div>
          {/*<div className='date-recall'>
            <p>{daysSinceCreation}G</p>
            {data?.recallDate && normalizedRecallDate < normalizedToday ?
            <img src={recRed} alt="Recall" />
            : data?.recallDate && normalizedRecallDate == normalizedToday ? 
            <img src={recYellow} alt="Recall" />
          : data?.recallDate && normalizedRecallDate > normalizedToday ?
           <img src={recGreen} alt="Recall" /> : null}
          </div>*/}
          <div className='options'>
            <div className="sposta" onClick={() => handleModifyPopupEsito(data)}>Sposta</div>
          </div>
        </div>
        {/*<div className="elim">
              <svg onClick={() => handleRowClick(data)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z" /></svg>
        </div>*/}
      </div>
    )
  return <></>
}
