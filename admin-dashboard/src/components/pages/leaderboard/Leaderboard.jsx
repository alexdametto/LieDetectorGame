import React, {useState, useEffect} from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Loader from "react-loader-spinner";
import "./leaderboard.scss";
import Navbar from '../../common/navbar/Navbar';
import AdminService from '../../../services/adminService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    );
  }

function Leaderboard() {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);

    const [leaderboard, setLeaderboard] = useState({
        byWins: [],
        byRate: [],
        byMatches: [],
        byPoints : []
    })

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        AdminService.getLeaderboard().then((res) => {
            setLeaderboard(res.data);
            setLoading(false);
        });
    }, []);

    if(loading) {
      return (
          <div className="loader-container">
              <Loader
                  type="TailSpin"
                  color="#00BFFF"
                  height={100}
                  width={100}
              />
          </div>
      )
    }

    const columnWidthVittorie = 100/7 + "%";
    const columnWidthRateo = 100/7 + "%";
    const columnWidthPartite = 100/7 + "%";

    return (
        <div>
            <Navbar></Navbar>

            <AppBar position="static">
                <Tabs value={tabValue} onChange={handleChangeTab} centered>
                    <Tab label="PER VITTORIE" {...a11yProps(0)} />
                    <Tab label="PER RATEO" {...a11yProps(1)} />
                    <Tab label="PER PUNTI TOTALI" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <TabPanel value={tabValue} index={0}>
                <TableContainer>
                  <Table stickyHeader >
                    <TableHead>
                      <TableRow>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Posizione</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Nickname</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Email</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Vittorie</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Sconfitte</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Pareggi</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Punti totali</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {
                        leaderboard.byWins.map((user, userIndex) => {
                          return (
                            <TableRow key={userIndex}>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {userIndex + 1}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.nickname}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.email}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.wins}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.losses}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.draws}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.points}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <TableContainer>
                  <Table stickyHeader >
                    <TableHead>
                      <TableRow>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Posizione</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Nickname</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Email</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Vittorie</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Sconfitte</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Pareggi</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Punti totali</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {
                        leaderboard.byRate.map((user, userIndex) => {
                          return (
                            <TableRow key={userIndex}>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {userIndex + 1}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {user.nickname}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {user.email}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {user.wins}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {user.losses}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthRateo}}>
                                {user.draws}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.points}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <TableContainer>
                  <Table stickyHeader >
                    <TableHead>
                      <TableRow>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Posizione</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Nickname</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Email</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Vittorie</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Sconfitte</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Pareggi</TableCell>
                        <TableCell align="left" style={{width: columnWidthVittorie}}>Punti totali</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {
                        leaderboard.byPoints.map((user, userIndex) => {
                          return (
                            <TableRow key={userIndex}>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {userIndex + 1}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {user.nickname}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {user.email}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {user.wins}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {user.losses}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthPartite}}>
                                {user.draws}
                              </TableCell>
                              <TableCell align="left" style={{width: columnWidthVittorie}}>
                                {user.points}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
            </TabPanel>
        </div>
    )
}

export default Leaderboard;