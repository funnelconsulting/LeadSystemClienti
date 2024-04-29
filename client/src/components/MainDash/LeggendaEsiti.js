import React from 'react'
import { BsArrowReturnLeft } from "react-icons/bs";

const LeggendaEsiti = ({handleNotShow}) => {
  return (
    <div className="legenda-container">
        <div className="leggenda-top">
        <BsArrowReturnLeft className="indietro-icona"/>
        <p>Leggenda esiti</p>
        </div>  
        <div className="esiti-list">
            <div className="esiti-item">
                <span>0</span>
                <div>
                <p>Da contattare</p>
                <p>Lead generate che devono essere contattati per la prima volta</p>
                </div>
            </div>
            <div className="esiti-item">
                <span>0</span>
                <div>
                <p>Da richiamare</p>
                <p>Lead che non hanno risposto alla telefonata o  che in quel momento non potevano parlare, quindi l’operatore ha concordato con la loro una recall</p>
                </div>
            </div>
            <div className="esiti-item">
                <span>0</span>
                <div>
                <p>Lead persa</p>
                <p>Lead non interessata, numero errato, o che non ha mai risposto</p>
                </div>
            </div>
            <div className="esiti-item">
                <span>0</span>
                <div>
                <p>Opportunità</p>
                <p>Lead interessate al servizio, in fase di trattativa.</p>
                </div>
            </div>
            <div className="esiti-item">
                <span>0</span>
                <div>
                <p>Venduto</p>
                <p>Lead che ha acquistato il servizio offerto</p>
                </div>
            </div>
        </div> 
        <div className='btn-dentro-legenda'>
            <button onClick={handleNotShow}>Indietro</button>
        </div>
    </div>  
  )
}

export default LeggendaEsiti