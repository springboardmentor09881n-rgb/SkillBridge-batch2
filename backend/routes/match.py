from fastapi import APIRouter
from schemas.match_schema import MatchRequest

router = APIRouter()

# dummy opportunities (replace later with DB)
opportunities = [
    {"id": 1, "title": "Teach Python", "skills": ["python"], "location": "Chennai"},
    {"id": 2, "title": "Web Dev", "skills": ["html", "css"], "location": "Bangalore"},
    {"id": 3, "title": "Django Backend", "skills": ["python", "django"], "location": "Chennai"},
]

@router.post("/match")
def match_opportunities(request: MatchRequest):

    matched = []

    for opp in opportunities:
        skill_match = len(set(request.skills) & set(opp["skills"]))
        location_match = request.location.lower() == opp["location"].lower()

        score = skill_match
        if location_match:
            score += 1

        if score > 0:
            matched.append({
                "opportunity_id": opp["id"],
                "title": opp["title"],
                "match_score": score
            })

    # sort by best match
    matched.sort(key=lambda x: x["match_score"], reverse=True)

    return {"matches": matched}