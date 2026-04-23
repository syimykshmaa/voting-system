function serializeUser(userDoc) {
  if (!userDoc) return null;
  return {
    id: String(userDoc._id),
    name: userDoc.name,
    username: userDoc.username,
    email: userDoc.email,
    role: userDoc.role,
    createdAt: new Date(userDoc.createdAt).toISOString().split("T")[0],
  };
}

function serializeElection(electionDoc) {
  if (!electionDoc) return null;
  return {
    id: String(electionDoc._id),
    title: electionDoc.title,
    description: electionDoc.description,
    status: electionDoc.status,
    startDate: electionDoc.startDate,
    endDate: electionDoc.endDate,
    createdBy: String(electionDoc.createdBy),
    candidates: (electionDoc.candidates || []).map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party || "",
      bio: c.bio || "",
    })),
  };
}

function serializeVote(voteDoc) {
  if (!voteDoc) return null;
  return {
    id: String(voteDoc._id),
    userId: String(voteDoc.userId),
    electionId: String(voteDoc.electionId),
    candidateId: voteDoc.candidateId,
    timestamp: new Date(voteDoc.timestamp).toISOString(),
  };
}

module.exports = { serializeUser, serializeElection, serializeVote };
