import React from 'react'
import { NavLink } from 'react-router-dom'

function SideBar () {
  return (
    <nav style={navStyle}>
      <div style={brandStyle}>Badge Manager</div>
      <div style={linksStyle}>
        <NavLink end to='/' style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
          Manage Rules
        </NavLink>
        <NavLink to='/assignments' style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
          Manual Assignments
        </NavLink>
        <NavLink to='/monitor' style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeLinkStyle : {}) })}>
          Active Badges
        </NavLink>
      </div>
    </nav>
  )
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#1473e6',
  padding: '0 24px',
  height: '52px',
  width: '100%',
  boxSizing: 'border-box',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
}

const brandStyle = {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: '16px',
  marginRight: '32px',
  letterSpacing: '0.3px',
  whiteSpace: 'nowrap'
}

const linksStyle = {
  display: 'flex',
  gap: '4px'
}

const linkStyle = {
  color: 'rgba(255,255,255,0.85)',
  textDecoration: 'none',
  padding: '6px 16px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background 0.15s ease'
}

const activeLinkStyle = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: '#ffffff'
}

export default SideBar
