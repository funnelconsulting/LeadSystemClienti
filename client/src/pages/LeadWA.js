import React, { useEffect, useState, useContext, useRef } from 'react'
import Sidebar from '../components/SideBar/Sidebar'
import TopDash from '../components/MainDash/TopDash';
import { FlagFilled, SyncOutlined } from "@ant-design/icons";
import './LeadWA.scss'
import { UserContext } from "../context";
import EmojiPicker, { Emoji } from 'emoji-picker-react';
import Message from '../components/Message/Message';
import axios from 'axios';
import { SearchOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { SidebarContext } from '../context/SidebarContext';
import PopupModify from '../components/Table/popupModify/PopupModify';
import whats1 from '../imgs/whats1.png';
import whats2 from '../imgs/whats2.png';
import whats3 from '../imgs/whats3.png';
import whats4 from '../imgs/whats4.png';
import bot from '../imgs/bot.png';
import prova from '../imgs/view_photo.png';
import chatback from '../imgs/whats-back.png';
import { FaStar, FaPhoneAlt, FaEllipsisV, FaMicrophone, FaPaperclip } from 'react-icons/fa';
import moment from 'moment';


const Chat = ({ messages, setFavorite, selectChat }) => {
  return (
    <div className="chat-container">
      <div className='chat-header'>
        <p>
          <img src={bot} />
          Il chatbot è attivo
        </p>
        <div className='chat-absolute-top'>
          <img src={whats1} />
          <img src={whats2} />
        </div>
      </div>
      <div className="chat-header-name">
        <div>
          <img src={prova} alt="Profile" className="profile-image" />
          <div className="profile-info">
            {selectChat && <h2>{selectChat.first_name ? selectChat.first_name + ' ' + selectChat.last_name : 'Utente'}</h2>}
            {selectChat && <p>Attivo oggi alle 12:30 AM</p>}
          </div>
        </div>
        <div>
          <FaStar onClick={() => setFavorite(selectChat)} className='icon-header' />
          <FaPhoneAlt className='icon-header' />
          <FaEllipsisV className='icon-header'/>
        </div>
      </div>
      <div className="chat-body">
        {selectChat && selectChat.messages?.map((msg) => (
            <Message
            key={msg._id}
            msgdata={msg.content}
            sender={msg.sender}
            timestamp={msg.timestamp}
          />
        ))}
      </div>
      <div className="chat-footer">
        <input type="text" placeholder="Digita un messaggio..." />
        <FaMicrophone onClick={() => setFavorite(selectChat)} className='icon-header' />
        <FaPaperclip className='icon-header' />
      </div>
    </div>
  );
};

export default function LeadWA() {

  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useContext(UserContext);
  const userId = state.user._id;
  const [leadMessaging, setLeadMessaging] = useState();
  const [activeChat, setActiveChat] = useState([]);
  const [infoPopup, setInfoPopup] = useState(false);
  const [selectLead, setSelectLead] = useState();
  const [message, setMessage] = useState('');
  const [number, setNumber] = useState();
  const [selectChat, setSelectChat] = useState(null)
  //lead chat list
  const [leadsChat, setLeadsChat] = useState([]);

  const handleInfoPopup = (lead) => {
    setSelectLead(lead);
    setInfoPopup(true);
  }

  console.log(leadMessaging);
  const handleAlreadyChat = (lead) => {
    console.log(lead);
    setTimeout(() => {
      const leadData = {
        id: lead._id,
        name: lead.nome && lead.nome !== null ? lead.nome : '',
        surname: lead.cognome,
        telephone: lead.numeroTelefono,
      };
      setLeadMessaging(leadData);
    }, 500);
  };


  function handlePasteClick() {
    // Check if the Clipboard API is available
    if (navigator.clipboard) {
      // Read the text from the clipboard
      navigator.clipboard.readText().then(function (text) {
        SETinputMsg(text)
      }).catch(function (error) {
        console.error('Failed to read clipboard contents: ', error);
      });
    } else {
      console.error('Clipboard API not supported');
    }
  }

  console.log(process.env.REACT_APP_API_CHATBOT)
  const fetchChats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_CHATBOT}/get-all-chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { chats } = data;
      console.log(data);
      setLeadsChat(chats)
      setIsLoading(false)
    } catch (error) {
      console.error(error);
    }
  };


  const sendMessageTest = async () => {
    try {
      const response = await axios.post('/sendMessageWa', {
        message: inputMsg,
        phoneNumber: leadMessaging.telephone,
        leadId: leadMessaging.id,
        userId: userId,
      });

      toast.success('Hai inviato il messaggio!');
      const chatAttiva = activeChat.find(chat => chat.leadId._id === leadMessaging.id);
      fetchChats();

      setActiveChat((prevChat) => {
        const chatIndex = prevChat.findIndex(chat => chat.leadId._id === leadMessaging.id);
        if (chatIndex !== -1) {

          const updatedChat = { ...prevChat[chatIndex] };
          console.log(updatedChat);
          const updatedMessages = [...updatedChat.messages, { content: inputMsg, sender: 'user' }];
          updatedChat.messages = updatedMessages;
          const updatedChats = [...prevChat];
          updatedChats[chatIndex] = updatedChat;
          SETselected(updatedChat);
          return updatedChats;
        } else {
          return [...prevChat, {
            id: 'new-chat-id',
            leadId: leadMessaging, 
            messages: [{ content: inputMsg, sender: 'user' }]
          }];
        }
      });

      SETinputMsg('');
    } catch (error) {
      console.error(error.message);
    }
  };

  const [selected, SETselected] = useState(null);
  const [showEmojis, SETshowEmojis] = useState(false)
  const [selectedEmoji, SETselectedEmoji] = useState('')
  const [inputMsg, SETinputMsg] = useState('')
  const [windowtoggle, SETwindowtoggle] = useState(false)
  const [search, SETsearch] = useState('')

  const onEmojiClick = (emojiData, event) => {
    SETselectedEmoji(emojiData.unified);
    SETshowEmojis(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessageTest();
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const JustClosePopup = () => {
    setInfoPopup(false);
  };

  const deleteLead = async (leadId) => {
    try {
      const response = await axios.delete('/delete-lead', { data: { id: leadId } });
      console.log(response.data.message);
      toast.success('Hai eliminato correttamente il lead');
      setInfoPopup(false);
    } catch (error) {
      console.error(error.message);
      toast.error('Si è verificato un errore.')
    }
  };

  const popupRef = useRef(null);
  const getLastMessage = (messages) => {
    if (messages.length === 0) {
      return null;
    }
    
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return messages[messages.length - 1];
  };
  const formatTime = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment();
  
    if (messageDate.isSame(today, 'day')) {
      return messageDate.format('HH:mm');
    } else {
      return messageDate.format('DD-MM HH:mm');
    }
  };

  const sortChatsByLastMessage = (chats) => {
    return chats.sort((a, b) => {
      const lastMessageA = getLastMessage(a.messages);
      const lastMessageB = getLastMessage(b.messages);
  
      return new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp);
    });
  };

  const messagesChat = [
    {
      id: 1,
      sender: "Fabio Massimo Nardella",
      message: "Ciao! Sono interessato al corso Online di giurisprudenza. Vorrei fissare una call.",
      time: "11:35 AM",
      type: "received"
    },
    {
      id: 2,
      sender: "Sara",
      message: "Perfetto, indicami un orario ed una data, organizzerò il tuo appuntamento.",
      time: "11:36 AM",
      type: "sent"
    },
    {
      id: 3,
      sender: "Fabio Massimo Nardella",
      message: "Venerdì 12 luglio alle ore 14:00",
      time: "11:36 AM",
      type: "received"
    },
    {
      id: 4,
      sender: "Sara",
      message: "Grazie! La tua call è stata fissata il giorno Venerdì 12 Luglio alle ore 14:00",
      time: "11:36 AM",
      type: "sent"
    }
  ];

  const handleSetFavorite = (chatId) => {
    console.log(chatId)
  }

  return (
    <div>
      {isLoading ?
        <div
          className="d-flex justify-content-center fw-bold"
          style={{ height: "90vh" }}
        >
          <div className="d-flex align-items-center">
            <SyncOutlined spin style={{ fontSize: "50px" }} />
          </div>
        </div>
        :
        <div className='chat-container'>
          <div className='top-chat-container'></div>
          <div className='body-chat-container'>
            <div className='chat-selected-container'>
              <Chat messages={messagesChat} setFavorite={handleSetFavorite} selectChat={selectChat} />
            </div>
            <div className='chat-list-container'>
              <div>
                <input type='text' placeholder='cerca' />
                <img src={whats3} />
                <img src={whats4} />
              </div>
              <div className='list'>
                  {leadsChat.length > 0 && sortChatsByLastMessage(leadsChat)?.map((msg) => {
                    const lastMessage = getLastMessage(msg.messages)
                    return (
                      <div key={msg._id} onClick={() => setSelectChat(msg)} className={selectChat._id === msg._id ? "chat-item chat-item-selected" : 'chat-item'}>
                        <img src={prova} alt={msg.name} className="profile-image" />
                        <div className="message-content">
                          <div className="message-header">
                            <span className="name">{msg.first_name !== "" ? msg.first_name + ' ' + msg.last_name : 'Utente'}</span>
                          </div>
                          <div className="message-text">{lastMessage?.content.substring(0, 45) + '...'}</div>
                        </div>
                        <span className="time">{formatTime(lastMessage?.timestamp)}</span>
                      </div>
                    )})}
              </div>
            </div>
          </div>
        </div>
      }
            {infoPopup &&
            <PopupModify
              onClose={JustClosePopup}
              lead={selectLead}
              setPopupModify={() => setInfoPopup(false)}
              deleteLead={deleteLead}
              popupRef={popupRef}
              setInfoPopup={setInfoPopup}
            />
          }
    </div>
  )
}
