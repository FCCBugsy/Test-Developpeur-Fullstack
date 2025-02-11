import mongoose from "mongoose";

const EntrepriseSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const UserSchema = new mongoose.Schema({
    entreprise: { type: mongoose.Schema.Types.ObjectId, ref: "Entreprise", required: true },
    nom: { type: String, required: true },
    email: { type: String, unique: true, required: true }
});

const TacheSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    titre: { type: String, required: true },
    description: String,
    dateCreation: { type: Date, default: Date.now },
    deadline: Date,
    dateCompletee: Date,
    statut: { type: String, enum: ["en attente", "complétée"], default: "en attente" },
    usersAsignees: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Responsable", "Relecteur", "Suiveur"] }
    }],
    commentaires: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tachesLiees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tache" }]
});

const CommentaireSchema = new mongoose.Schema({
    tache: { type: mongoose.Schema.Types.ObjectId, ref: "Tache", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contenu: { type: String, required: true },
    datePostee: { type: Date, default: Date.now }
});

const Entreprise = mongoose.model("Entreprise", EntrepriseSchema);
const User = mongoose.model("User", UserSchema);
const Tache = mongoose.model("Tache", TacheSchema);
const Comment = mongoose.model("Comment", CommentaireSchema);

module.exports = { Entreprise, User, Tache, Comment };