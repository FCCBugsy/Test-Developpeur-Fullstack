import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI);

const MatchSchema = new mongoose.Schema({
    player1: {
        type: String, required: true
    },
    player2: {
        type: String, required: true
    },
    score: {
        type: String, required: true
    },
    winner: {
        type: String, default: undefined
    },
    date: {
        type: Date, default: Date.now
    }
});
const Match = mongoose.model('Match', MatchSchema);

app.post('/api/match', async (req, res) => {
    try {
        const { player1, player2, score, winner } = req.body;
        if (!player1 || !player2 || !score) return res.status(400).json({ message: 'Il manque des arguments' });
    
        const match = new Match({ player1, player2, score, winner });
        await match.save();
        res.json(match);
    }

    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

const PORT = process.env.PORT || 5172;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));