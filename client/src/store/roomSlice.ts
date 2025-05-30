import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RoomPlayer {
  sessionId: string;
  username: string;
  isHost: boolean;
}

export interface Room {
  id: string;
  name?: string;
  players: RoomPlayer[];
  maxPlayers: number;
  isPlaying: boolean;
  status: string;
  currentPlayer?: {
    socketId: string;
    playerId: string;
    name: string;
  };
}

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = action.payload;
    },
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload ? { ...action.payload } : null;
    },
    updateRoom: (state, action: PayloadAction<Room>) => {
      const room = action.payload;
      state.rooms = state.rooms.map(r => 
        r.id === room.id ? { ...room } : r
      );
      if (state.currentRoom?.id === room.id) {
        state.currentRoom = { ...room };
      }
    }
  }
});

export const { setRooms, setCurrentRoom, updateRoom } = roomSlice.actions;
export default roomSlice.reducer; 