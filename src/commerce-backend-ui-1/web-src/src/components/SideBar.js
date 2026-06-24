import React from 'react'
import { NavLink } from 'react-router-dom'
import { IconTag } from '@tabler/icons-react'

function SideBar () {
  return (
    <nav className='bm-nav'>
      <div className='bm-nav-brand'>
        <div className='bm-nav-logo'><IconTag size={15} /></div>
        Badge Manager
      </div>
      <NavLink end to='/' className={({ isActive }) => `bm-nav-tab${isActive ? ' active' : ''}`}>
        Manage Rules
      </NavLink>
      <NavLink to='/assignments' className={({ isActive }) => `bm-nav-tab${isActive ? ' active' : ''}`}>
        Manual Assignments
      </NavLink>
      <NavLink to='/monitor' className={({ isActive }) => `bm-nav-tab${isActive ? ' active' : ''}`}>
        Active Badges
      </NavLink>
    </nav>
  )
}

export default SideBar
