import React, { useContext } from 'react'
import './MainDash.scss';
import { SearchOutlined } from '@ant-design/icons';
import { UserContext } from "../../context";
import esporta from '../../imgs/export.png'
import { Popover } from 'antd';
import { FaArrowDown, FaArrowRight, FaArrowUp } from 'react-icons/fa';

const TopDash = ({ hideexport = false,
  hideLegend = false,
  hideall = false,
  hideattivi = false,
  hidecerca = false,
  hideciao = false,
  id,
  SETsearch,
  exportright = false,
  generatePdf,
  hideexportLeads = false,
  showLegenda,
  setShowLegenda,
}) => {
  const [state, setState] = useContext(UserContext);

  const popoverContent = (
    <div>
      <a style={{ cursor: 'pointer' }} onClick={generatePdf}>Export as CSV | XLS</a>
    </div>
  );

  function getDisplayName(user) {
    const name = user.role === "orientatore" ? user.nome : user.name;
    return name.length > 10 ? `${name.substring(0, 10)}...` : name;
  }

  if (hideall)
    return (
      <div id={id} className={"topDash " + (hideexport ? "dashhideexport" : "")}>
        <div className="topDash-item" id='fstdashitem'>
        </div>
        <div></div>

        <div className="topDash-item" id='lasttopdashitem'>
          <div id='fstdiv'>
            <span className='iniziale-top-dash'>{state.user.role && state.user.role === "orientatore" ? state.user.nome.charAt(0) : state.user.name ? state.user.name.charAt(0) : ""}</span>
            <p>ciao <span><u>{state.user.name}</u></span></p>
          </div>
        </div>
      </div>
    )
  else
    return (
      // <div>
      <div id={id} className={"topDash " + 
      (hideexport ? "dashhideexport" : "")+
      (exportright && "exportright")
      }
      style={hideexport && hideattivi ? {gap: '13rem', fontSize: '0.8rem'}  : null}
      >
        <div className="topDash-item" id='fstdashitem'>
          {!hidecerca &&
            <label className={hideexport ? "hideexport" : ""} style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: "6px 12px", backgroundColor: '#fff', borderRadius: 30, border: '1px solid #000' }}>
              <SearchOutlined color="white" id='looptopdash' />
              <input
                id='dashcerca'
                type="text"
                placeholder="Cerca.."
                style={{ border: 'none', outline: 'none' }}
                onChange={(e) => SETsearch ? SETsearch(e.target.value) : {}}
              />
            </label>
          }
          {/*!hideLegend && <button className="btn-legenda-visibile" onClick={() => setShowLegenda(!showLegenda)}>
            Legenda {showLegenda ? <FaArrowUp /> : <FaArrowRight />}
          </button>*/}
          {hideexport &&
            <div id='attiviora' style={{ display: (hideattivi && "none") }}>
              <div className="tit">Attivi ora</div>
              <div className="titnum">123</div>
              <div className="circles">
                <svg width="68" height="17" viewBox="0 0 68 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="8.5" r="8.5" fill="#973031" />
                  <circle cx="21" cy="8.5" r="8.5" fill="#30978B" />
                  <circle cx="32" cy="8.5" r="8.5" fill="#FBBC05" />
                  <circle cx="41" cy="8.5" r="8.5" fill="#179BD7" />
                  <circle cx="50" cy="8.5" r="8.5" fill="#231F20" />
                  <circle cx="59" cy="8.5" r="8.5" fill="#CB17A3" />
                </svg>
                <span>Fabio M, e...</span>
              </div>

            </div>
          }
        </div>

        <div className="topDash-item" id='lasttopdashitem'>
          {hideexport &&
            <div id='dwrep'>
              <a style={{cursor: 'pointer'}} onClick={generatePdf}>Scarica report</a>
              <svg style={{ rotate: "90deg" }} width="25" height="25" viewBox="0 0 33 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M-4.52725e-07 19.0576L14.4375 19.0576L14.4375 25.303L24.75 14.8939L14.4375 4.48479L14.4375 10.7303L-8.14905e-07 10.7303L-4.52725e-07 19.0576ZM28.875 29.4667L33 29.4667L33 0.321146L28.875 0.321147L28.875 29.4667Z" />
              </svg>
            </div>
          }

        {hideexportLeads &&
          <Popover content={popoverContent} title="" trigger="hover">
            <div id='dwrep' style={{cursor: 'pointer'}} onClick={generatePdf}>
              <img alt='esporta' src={esporta} />
              {/*<a className='export-lead' style={{cursor: 'pointer'}} onClick={generatePdf}>Export as CSV | XLS</a>*/}
            </div>
          </Popover>
          }
          {/*!hideciao &&
            <div id='fstdiv'>
              <span className='iniziale-top-dash'>{state.user.role && state.user.role === "orientatore" ? state.user.nome.charAt(0) : state.user.name ? state.user.name.charAt(0) : ""}</span>
              <p>ciao <span><u>{getDisplayName(state.user)}</u></span></p>
            </div>
          */}
        </div>
      </div>
      // </div>
    )
}

export default TopDash