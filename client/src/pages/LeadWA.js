import React, { useEffect, useState, useContext, useRef } from 'react'
import { SyncOutlined } from "@ant-design/icons";
import './LeadWA.scss'
import { UserContext } from "../context";
import Message from '../components/Message/Message';
import axios from 'axios';
import toast from 'react-hot-toast';
import PopupModify from '../components/Table/popupModify/PopupModify';
import whats1 from '../imgs/whats1.png';
import whats2 from '../imgs/whats2.png';
import whats3 from '../imgs/whats3.png';
import whats4 from '../imgs/whats4.png';
import bot from '../imgs/bot.png';
import prova from '../imgs/view_photo.png';
import chatback from '../imgs/whats-back.png';
import { Switch, message } from 'antd';
import { FaStar, FaPhoneAlt, FaEllipsisV, FaMicrophone, FaPaperclip, FaBell } from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import moment from 'moment';
import { SocketContext } from '../context/SocketContext';
import { useLocation } from 'react-router-dom';

export default function LeadWA() {
  const location = useLocation();
  const socket = useContext(SocketContext);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useContext(UserContext);
  const userId = state.user?._id;
  const [leadMessaging, setLeadMessaging] = useState();
  const [activeChat, setActiveChat] = useState([]);
  const [infoPopup, setInfoPopup] = useState(false);
  const [selectLead, setSelectLead] = useState();
  const [number, setNumber] = useState();
  const [selectChat, setSelectChat] = useState(null)
  const [newChat, setNewChat] = useState([])
  const chatBodyRef = useRef(null);
  const [leadsChat, setLeadsChat] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInfoPopup = (lead) => {
    setSelectLead(lead);
    setInfoPopup(true);
  }

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [selectChat?.messages]);

  useEffect(() => {
    if (socket) {
      socket.on('updateChat', (updatedChat) => {
        console.log(updatedChat)
        setLeadsChat((prevLeadsChat) => {
          const chatIndex = prevLeadsChat.findIndex(chat => chat.numeroTelefono === updatedChat.numeroTelefono);
          if (chatIndex === -1) {
            // Se la chat non esiste, aggiungi la nuova chat
            return [...prevLeadsChat, updatedChat];
          } else {
            const updatedLeadsChat = [...prevLeadsChat];
            updatedLeadsChat[chatIndex] = updatedChat;
            return updatedLeadsChat;
          }
        });

        setNewChat((prevLeadsChat) => {
          const chatIndex = prevLeadsChat.findIndex(chat => chat.numeroTelefono === updatedChat.numeroTelefono);
          if (chatIndex === -1) {
            return [...prevLeadsChat, updatedChat];
          } else {
            const updatedLeadsChat = [...prevLeadsChat];
            updatedLeadsChat[chatIndex] = updatedChat;
            return updatedLeadsChat;
          }
        });

        if (selectChat && selectChat.numeroTelefono === updatedChat.numeroTelefono) {
          setSelectChat(updatedChat);
        }
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('_id');

    if (chatId) {
      const selectedChat = leadsChat.find(chat => chat._id === chatId);
      if (selectedChat) {
        setSelectChat(selectedChat);
      }
    }
  }, [location.search, leadsChat, setSelectChat]);

  function handlePasteClick() {
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

  const [inputMsg, SETinputMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [textMessage, setTextMessage] = useState('')

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

  const handleChatClick = (chat) => {
    setSelectChat(chat);
    setNewChat((prevNewChat) => prevNewChat.filter(c => c.numeroTelefono !== chat.numeroTelefono));
  };

  const handleSwitchChange = async (checked) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_CHATBOT}/updateChatStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeroTelefono: selectChat.numeroTelefono, newStatus: !selectChat.active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat status');
      }

      const data = await response.json();
      console.log(data)
      setSelectChat(prevChat => ({
        ...prevChat,
        active: !selectChat.active,
      }));

      setLeadsChat(prevChats =>
        prevChats.map(chat =>
          chat.numeroTelefono === selectChat.numeroTelefono ? { ...chat, active: !selectChat.active } : chat
        )
      );

      message.success('Chat status updated successfully');
    } catch (error) {
      console.log(error)
      message.error('Failed to update chat status');
    }
    setLoading(false)
  };

  const handleFavoriteChange = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_CHATBOT}/updateChatFavorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeroTelefono: selectChat.numeroTelefono, newStatus: !selectChat.favorite }),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat status');
      }

      const data = await response.json();
      console.log(data)
      setSelectChat(prevChat => ({
        ...prevChat,
        favorite: !selectChat.favorite,
      }));

      setLeadsChat(prevChats =>
        prevChats.map(chat =>
          chat.numeroTelefono === selectChat.numeroTelefono ? { ...chat, favorite: !selectChat.favorite } : chat
        )
      );

      message.success('Chat status updated successfully');
    } catch (error) {
      console.log(error)
      message.error('Failed to update chat status');
    }
  };

  const sendWhatsappMessage = async (numeroTelefono) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_CHATBOT}/sendWhatsappMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeroTelefono, textMessage }),
      });
      console.log(response)
      const data = await response.json();
  
      if (data.success) {
        message.success('Messaggio inviato con successo');
  
        setSelectChat(prevChat => ({
          ...prevChat,
          messages: [...prevChat.messages, { sender: 'bot', content: textMessage, timestamp: new Date(), manual: true }],
        }));
  
        setLeadsChat(prevChats =>
          prevChats.map(chat =>
            chat.numeroTelefono === numeroTelefono
              ? { ...chat, messages: [...chat.messages, { sender: 'bot', content: textMessage, timestamp: new Date(), manual: true }] }
              : chat
          )
        );
        setTextMessage("")
      } else {
        message.error('Invio del messaggio fallito');
      }
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      message.error('Errore durante l\'invio del messaggio');
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredChats = leadsChat?.filter(chat => {
    const term = searchTerm.toLowerCase();
    const fullName = `${chat.first_name} ${chat.last_name}`.toLowerCase();
    return (
      fullName.includes(term) ||
      chat.numeroTelefono?.toLowerCase().includes(term) ||
      chat.email?.toLowerCase().includes(term)
    );
  });
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
              {(
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
                      {selectChat && <div>
                        <FaStar onClick={() => handleFavoriteChange()} className={selectChat?.favorite ? 'icon-header icon-favorite' : 'icon-header'} />
                        <Switch
                          className="custom-switch"
                          checked={selectChat?.active}
                          onChange={handleSwitchChange}
                          loading={loading}
                        />
                        <FaEllipsisV className='icon-header'/>
                      </div>}
                    </div>
                    <div className="chat-body" ref={chatBodyRef}>
                      {selectChat && selectChat.messages?.map((msg, index) => (
                          <Message
                          key={index}
                          msgdata={msg.content}
                          sender={msg.sender}
                          timestamp={msg.timestamp}
                        />
                      ))}
                    </div>
                    <div className="chat-footer">
                      <input type="text" placeholder="Digita un messaggio..." value={textMessage} onChange={(e) => setTextMessage(e.target.value)} />
                      <IoIosSend onClick={textMessage !== '' && selectChat ? () => sendWhatsappMessage(selectChat?.numeroTelefono) : null} className='icon-header' />
                    </div>
                  </div>
              )}
            </div>
            <div className='chat-list-container'>
              <div>
                <input value={searchTerm} onChange={(e) => handleSearchChange(e)} type='text' placeholder='cerca' />
                <img src={whats3} />
                <img src={whats4} />
              </div>
              <div className='list'>
                  {filteredChats.length > 0 && sortChatsByLastMessage(filteredChats)?.map((msg) => {
                    const lastMessage = getLastMessage(msg.messages)
                    const isNewChat = newChat.some(chat => chat.numeroTelefono === msg.numeroTelefono);
                    console.log(isNewChat)
                    return (
                      <div key={msg?._id} onClick={() => handleChatClick(msg)} className={(selectChat && selectChat?._id === msg._id) ? "chat-item chat-item-selected" : 'chat-item'}>
                        <img src={prova} alt={msg.name} className="profile-image" />
                        <div className="message-content">
                          <div className="message-header">
                            <span className="name-list-chat">{msg.first_name !== "" ? msg.first_name + ' ' + msg.last_name : 'Utente'}</span>
                          </div>
                          <div className="message-text">{lastMessage?.content.substring(0, 45) + '...'}</div>
                        </div>
                        <span className="time">{formatTime(lastMessage?.timestamp)}</span>
                        {isNewChat && <FaBell className="new-message-icon" />}
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
