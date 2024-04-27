import * as React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';


import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

function SidebarItem() {
  return (
    <ListItem
      disablePadding
      sx={{
        whiteSpace: 'nowrap'
      }}
    >
      <ListItemButton>
        <ListItemIcon sx={{minWidth: 0, mr: 0.75}}>
          <ChatBubbleOutlineIcon fontSize='small'/>
        </ListItemIcon>
        <ListItemText primary={
          <Box
            component='div'
            sx={{ textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '0.875rem', }}>
            New Chat aiusujoijhf iiejasuoisedgp uiogdu9oesguo9p
          </Box>
        } />
      </ListItemButton>
    </ListItem>
  )
}

export default SidebarItem;