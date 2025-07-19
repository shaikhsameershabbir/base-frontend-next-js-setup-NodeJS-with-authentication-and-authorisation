import { ReactNode } from "react";

export interface Game {
  title: string;
  numbers?: string;
  status: string;
  timeOpen: string;
  timeClose: string;
}

export interface Message {
    message: string;
}

export interface Bid {
  marketname: string;
  gametype: string;
  digit: number;
  point: number;
  Transcationtime: string;
  resultmessage: string;
}

export interface Passbook {
  id: number;
  date: string;
  particulars: string;
  previousPoints: number;
  transactionAmount: number;
  currentAmount: number;
  details: {
    type: string;
    gameName: string;
    gameWin: string;
    providerName: string;
    dateTime: string;
    playedFor: string;
    winRatio: string;
    bidAmount: number;
    status: string;
  }
}

export interface Fund {
  infomessage: ReactNode;
  AvailableBalance: ReactNode;
  boxmessage: ReactNode;
  boxname: ReactNode;
  addfund:{
    boxname: string;
    boxmessage: string;
    AvailableBalance: number;
    infomessage: string;
  }
  withdrawfund:{  
    boxname: string;
    username: string;
    accountnumber: string;
    boxmessage: string;
    AvailableBalance: number;
    infomessage: string;
    note: string;
  },
  addbackdetails:{
    accountnumber: string;
    IFSCcode: string;
    Bankname: string;
    ACHoldername: string;
  }
}

export interface GameRate {
  message: string;
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  r5: string;
  r6: string;
  r7: string;
}

export const games: Game[] = [
  {
    title: 'KARNATAKA DAY',
    numbers: '344-15-249',
    status: 'Market close for today',
    timeOpen: '10:00 AM',
    timeClose: '11:00 AM',
  },
  {
    title: 'SRIDEVI',
    numbers: '458-7*-***',
    status: 'Running for close',
    timeOpen: '11:30 AM',
    timeClose: '12:30 PM',
  },
  {
    title: 'TIME BAZAR',
    numbers: '***-**-***',
    status: 'Market is open',
    timeOpen: '01:05 PM',
    timeClose: '02:06 PM',
  },
  {
    title: 'MADHUR DAY',
    numbers: '***-**-***',
    status: 'Market is open',
    timeOpen: '01:29 PM',
    timeClose: '02:29 PM',
  },
  {
    title: 'RAJDHANI DAY',
    status: 'Coming soon',
    timeOpen: '03:15 PM',
    timeClose: '05:15 PM',
  },
  {
    title: 'MADHUR DAY',
    numbers: '***-**-***',
    status: 'Market is open',
    timeOpen: '01:29 PM',
    timeClose: '02:29 PM',
  },
  {
    title: 'RAJDHANI DAY',
    status: 'Coming soon',
    timeOpen: '03:15 PM',
    timeClose: '05:15 PM',
  }
];

export const messages: Message[] = [
  {
    message: 'Welcome to MK Booking, Most Trusted Satta Matka Experience From 2019'
  }
];

export const bids: Bid[] = [
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
  {
    marketname: 'KARNATAKA DAY',
    gametype: 'SINGLE',
    digit: 2,
    point: 50,
    Transcationtime: '11:00 AM',
    resultmessage: 'Better luck next time',
  },
];

export const passbook: Passbook[] = [
  {
    id: 1,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 2,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 3,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 4,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 5,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 6,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 7,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  },
  {
    id: 8,
    date: '2025-06-25',
    particulars: 'Bid (KARNATAKA DAY SINGLE : 2)',
    previousPoints: 100,
    transactionAmount: 50,
    currentAmount: 150,
    details: {
      type: "Single",
      gameName: "KARNATAKA DAY",
      gameWin: "2",
      providerName: "Admin",
      dateTime: "2025-06-25 12:30 PM",
      playedFor: "100",
      winRatio: "2x",
      bidAmount: 50,
      status: "Won"
    }
  }, 
];

export const funds: Fund[] = [
  {
    addfund: {
      boxname: "Add Funds",
      boxmessage: 'you can add fund to your account',
      AvailableBalance: 1000,
      infomessage: 'To Deposit Funds contact your account manager.Thank you !!!'
    },
    withdrawfund: {
      boxname: "Withdraw Funds",
      username: "Samsher",
      accountnumber: "1234567890",
      boxmessage: "Call or WhatsApp for Withdraw Related Queries",
      AvailableBalance: 1000,
      infomessage: "Withdraw Request Timing 10:00 AM to 11:00 PM",
      note: "Withdraw is available once per Day",
    },
    addbackdetails: {
      accountnumber: "",
      IFSCcode: "",
      Bankname: "",
      ACHoldername: ""
    },
    infomessage: undefined,
    AvailableBalance: undefined,
    boxmessage: undefined,
    boxname: undefined
  },
];

export const gameRate: GameRate[] = [
  {
    message: "Game Win Ratio For all Bids",
    r1: "Single 1Rs Ka 9Rs",
    r2: "Jodi 1Rs Ka 90Rs",
    r3: "Single Panna 1Rs Ka 150Rs",
    r4: "Double Panna 1Rs Ka 300Rs",
    r5: "Triple Panna 1Rs Ka 800Rs",
    r6: "Half Sangam 1Rs Ka 1000Rs",
    r7: "Full Sangam 1Rs Ka 1800Rs",
  }
];
export default games;