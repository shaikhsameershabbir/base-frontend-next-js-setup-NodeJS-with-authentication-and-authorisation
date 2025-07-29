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
  addfund: {
    boxname: string;
    boxmessage: string;
    AvailableBalance: number;
    infomessage: string;
  }
  withdrawfund: {
    boxname: string;
    username: string;
    accountnumber: string;
    boxmessage: string;
    AvailableBalance: number;
    infomessage: string;
    note: string;
  },
  addbackdetails: {
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



// Table data for LeftColumn
export const singlePannaNumbers = [
  128, 129, 120, 130, 140,
  137, 138, 139, 149, 159,
  146, 147, 148, 158, 168,
  236, 156, 157, 167, 230,
  245, 237, 238, 239, 249,
  290, 246, 247, 248, 258,
  380, 345, 256, 257, 267,
  470, 390, 346, 347, 348,
  489, 480, 490, 356, 357,
  560, 570, 580, 590, 456,
  579, 589, 670, 680, 690,
  678, 679, 689, 789, 780,
  123, 124, 125, 126, 127,
  150, 160, 134, 135, 136,
  169, 179, 170, 180, 145,
  178, 250, 189, 234, 190,
  240, 269, 260, 270, 235,
  259, 278, 279, 289, 280,
  268, 340, 350, 360, 370,
  349, 359, 369, 379, 389,
  358, 368, 378, 450, 460,
  367, 458, 459, 469, 479,
  457, 467, 468, 478, 569,
  790, 890, 567, 568, 578
];
export const doublePannaNumbers = [
  100, 110, 166, 112, 113,
  119, 200, 229, 220, 122,
  155, 228, 300, 266, 177,
  227, 255, 337, 338, 339,
  335, 336, 355, 400, 366,
  344, 499, 445, 446, 447,
  399, 660, 599, 455, 500,
  588, 688, 779, 699, 799,
  669, 778, 788, 770, 889,
  114, 115, 116, 117, 118,
  277, 133, 224, 144, 226,
  330, 188, 233, 199, 244,
  448, 223, 288, 225, 299,
  466, 377, 440, 388, 334,
  556, 449, 477, 559, 488,
  600, 557, 558, 577, 550,
  880, 566, 800, 667, 668,
  899, 700, 990, 900, 677
];
export const triplePannaNumbers = [111 ,222,333,444,555,666,777,888,999]


export const family = [
  [0, 5, 50, 55],
  [1, 6, 10, 15, 51, 56, 60, 65],
  [2, 7, 20, 25, 52, 57, 70, 75],
  [3, 8, 30, 35, 53, 58, 80, 85],
  [4, 9, 40, 45, 54, 59, 90, 95],
  [11, 16, 61, 66],
  [12, 17, 21, 26, 62, 67, 71, 76],
  [13, 18, 31, 36, 63, 68, 81, 86],
  [14, 19, 41, 46, 64, 69, 91, 96],
  [22, 27, 72, 77],
  [23, 28, 32, 37, 73, 78, 82, 87],
  [24, 29, 42, 47, 74, 79, 92, 97],
  [33, 38, 83, 88],
  [34, 39, 43, 48, 84, 89, 93, 98],
  [44, 49, 94, 99]
];


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