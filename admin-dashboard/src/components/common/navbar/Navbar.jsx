import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useHistory } from "react-router-dom";

import "./navbar.scss";
import JwtService from '../../../services/jwtService';

function Navbar() {
    let history = useHistory();

    const handleDrawerClose = () => {

    };

    const logout = () => {
        JwtService.logout();
        history.push("/login")
    }

    return (
        <div>
          <ClickAwayListener onClickAway={() => handleDrawerClose()}>
            <div>
                <AppBar position="static">
                    <Toolbar>
                    <Link href="/" className="homelink">
                        <Typography className="app-name" variant="title" color="inherit">
                            Admin Dashboard
                        </Typography>
                    </Link>
                    

                    <div className="links-container">
                        {
                            JwtService.isLogged() ? (
                                <Link href="#" onClick={() => logout()}>
                                    Logout
                                </Link>
                            ) : null
                        }
                    </div>

                    </Toolbar>
                </AppBar>
            </div>
          </ClickAwayListener>
        </div>
      );
}

export default Navbar;