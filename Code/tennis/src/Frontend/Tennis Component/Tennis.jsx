import { useState } from 'react';
import axios from 'axios';
import styles from './Tennis.module.scss';

const Tennis = () => {
    const [player1, setPlayer1] = useState({ name: 'Player 1', level: 5 });
    const [player2, setPlayer2] = useState({ name: 'Player 2', level: 5 });

    const [matchResultats, updateMatchPoints] = useState([]);
    const [score, setScore] = useState({
        sets: [[0, 0], [0, 0], [0, 0]],  // [ [Set1], [Set2], [Set3] ]
        currentGame: [0, 0],
        games: [0, 0],
        winner: undefined
    });

    const envoyerScoreAuBackend = async score => {
        try {
            const newScore = `${score.sets[0][0]}-${score.sets[0][1]}, ${score.sets[1][0]}-${score.sets[1][1]}, ${score.sets[2][0]}-${score.sets[2][1]}`;
            if (score.sets[0][0] === 0 && score.sets[0][1] === 0) return; // lors du premier envoie, on aura "0-0, 0-0, 0-0" dcp, faut empêcher l'envoie

            const response = await axios.post('http://localhost:5172/api/match', {
                player1: player1.name,
                player2: player2.name,
                score: newScore,
                winner: score.winner || undefined
            });

            console.log(response.data);
        } 
        
        catch (error) {
            console.error(error);
        }
    }

    function genererMatchPoints(player1, player2, totalPoints = 150) {
        const points = [];
        // ici, pour calculer la probabilité de victoire de chaque joueur, on divise le niveau du joueur par la somme des niveaux des deux joueurs, ce 
        // qui fait que si un joueur a un niveau plus élevé, il aura une probabilité plus élevée de gagner, ex: si player1.level = 10 et player2.level = 5,
        // le résultat sera 10 / (10 + 5) = 0.66, donc player1 a 66% de chance de gagner
        const probaPlayer1 = player1.level / (player1.level + player2.level);
        
    
        for (let i = 1; i <= totalPoints; i++) {
            const gagnant = Math.random() < probaPlayer1 ? player1.name : player2.name;
            points.push(gagnant);
        }
    
        return points;
    }

    function calculerScore(points) {
        let jeux = [0, 0]; 
        let sets = [[0, 0], [0, 0], [0, 0]];
        let pointsJeu = [0, 0]; 
        let setActuel = 0;
    
        for (const winner of points) {
            if (winner === player1.name) pointsJeu[0]++;
            else pointsJeu[1]++;
    
            // on vérifie si un joueur a gagné un jeu
            if ((pointsJeu[0] >= 4 && pointsJeu[0] >= pointsJeu[1] + 2) || (pointsJeu[1] >= 4 && pointsJeu[1] >= pointsJeu[0] + 2)) {
                if (pointsJeu[0] > pointsJeu[1]) jeux[0]++;
                else jeux[1]++;
        
                pointsJeu = [0, 0]; 
            }
    
            // on vérifie si un joueur a gagné un set
            if ((jeux[0] >= 6 && jeux[0] >= jeux[1] + 2) || (jeux[1] >= 6 && jeux[1] >= jeux[0] + 2)) {
    
                sets[setActuel] = [jeux[0], jeux[1]]; 
                setActuel++;
                jeux = [0, 0];
            }
    
            // on vérifie si un joueur a gagné le match
            if (sets.filter(s => s[0] > s[1]).length === 3) {
                setScore({ sets, currentGame: [0, 0], games: [0, 0], winner: player1.name });
                return;
            }

            if (sets.filter(s => s[1] > s[0]).length === 3) {
                setScore({ sets, currentGame: [0, 0], games: [0, 0], winner: player2.name });
                return;
            }
    
            // on vérifie si on est dans le 3ème set et si un joueur a gagné
            if (pointsJeu[0] >= 3 && pointsJeu[1] >= 3) {
                if (pointsJeu[0] === pointsJeu[1]) pointsJeu = ["40", "40"]; 
                else if (pointsJeu[0] === pointsJeu[1] + 1) pointsJeu = ["AV", "-"]; 
                else if (pointsJeu[1] === pointsJeu[0] + 1) pointsJeu = ["-", "AV"]; 
                else pointsJeu = [pointsJeu[0], pointsJeu[1]]; 
            } 
            
            else pointsJeu = [pointsJeu[0] * 15, pointsJeu[1] * 15]; 
        }
    
        setScore({ sets, currentGame: pointsJeu, games: jeux, winner: undefined });
    }

    const createGame = event => {
        event.preventDefault();
        
        const matchPoints = genererMatchPoints(player1, player2);
        updateMatchPoints(matchPoints);
        calculerScore(matchPoints);
        envoyerScoreAuBackend(score);
    }

    return (
        <div className={`${styles.tennisContainer} fadeIn`}>
            <form className={styles.tennisMatch}>
                <div className={styles.matchContainer}>
                    <div className={styles.tennisPlayer}>
                        <i className={`fas fa-user ${styles.icon}`}></i>
                        <div className={styles.tennisPlayerName}>{player1.name} ({player1.level})</div>

                        <div className={styles.inputContainer}>
                            <input type='text' onChange={(e) => setPlayer1(prev => ({ ...prev, name: e.target.value || 'Player 1' }))}
                                className={styles.input} placeholder='Nom du joueur 1' maxLength='20' />
                            <input type='number' min='1'  max='10' className={styles.input} placeholder='5' 
                                onChange={(e) => setPlayer1(prev => ({ ...prev, level: Number(e.target.value) || 5 }))} />
                        </div>
                    </div>

                    <div className={styles.tennisPlayer}>
                        <i className={`fas fa-user ${styles.icon}`}></i>
                        <div className={styles.tennisPlayerName}>{player2.name} ({player2.level})</div>

                        <div className={styles.inputContainer}>
                            <input  type='text' onChange={(e) => setPlayer2(prev => ({ ...prev, name: e.target.value || 'Player 2' }))}
                                className={styles.input} placeholder='Nom du joueur 2' maxLength='20' />
                            <input type='number'  min='1'  max='10' className={styles.input} placeholder='5' 
                                onChange={(e) => setPlayer2(prev => ({ ...prev, level: Number(e.target.value) || 5 }))} />
                        </div>
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button onClick={createGame} type='submit' className={styles.button}>Commencer Match</button>
                </div>

                
                {matchResultats.length > 0 && (
                    <div className={styles.matchResults}>
                        {matchResultats.map((point, index) => (
                            <div key={index} className={styles.matchPoint}>{point}</div>
                        ))}
                    </div>
                )}
                {matchResultats.length > 0 && (
                    <div className={styles.scoreTable}>
                        <h3>Score Actuel:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Set 1</th>
                                    <th>Set 2</th>
                                    <th>Set 3</th>
                                    <th>Jeu en cours</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{player1.name}</td>
                                    {score.sets[0].map((set, index) => <td key={index}>{set}</td>)}
                                    <td>{score.currentGame[0]}</td>
                                </tr>
                                <tr>
                                    <td>{player2.name}</td>
                                    {score.sets[1].map((set, index) => <td key={index}>{set}</td>)}
                                    <td>{score.currentGame[1]}</td>
                                </tr>
                            </tbody>
                        </table>
                        {score.winner && <h3>Vainqueur : {score.winner} !</h3>}
                    </div>
                )}
            </form>
        </div>
    )
}

export default Tennis;
