import { Popover } from 'antd'
import React from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import logout from '../imgs/logout.png'

const Logout = () => {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('payments');
        localStorage.removeItem('sub');
        localStorage.removeItem('table-lead');
        navigate('/login');
        toast.success('Ti sei disconnesso con successo!')
      }
    const popoverContent = (
        <div>
          <a style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout</a>
        </div>
      );
  return (
    <Popover content={popoverContent} title="" trigger="hover">
        <div className='logout-button' style={{cursor: 'pointer'}} onClick={handleLogout}>
        <img alt='esporta' src={logout} />
        </div>
    </Popover>
  )
}

export default Logout