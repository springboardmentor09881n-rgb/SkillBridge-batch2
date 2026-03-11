import { Clock, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import "./VolunteerOpportunities.css";

const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpps, setFilteredOpps] = useState([]);

  const [skillSearch, setSkillSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Open");

  useEffect(() => {
    // Example data (replace with API later)
    const sampleData = [
      {
        id: 1,
        title: "Website Redesign for Local Shelter",
        ngo: "Helping Hands",
        description:
          "Help us redesign our website to improve our online presence.",
        required_skills: ["Web Development", "UI/UX Design"],
        location: "New York",
        duration: "2-3 weeks",
        status: "Open"
      },
      {
        id: 2,
        title: "Translation of Educational Materials",
        ngo: "Global Literacy",
        description: "Translate educational materials for literacy programs.",
        required_skills: ["Translation", "Language Skills"],
        location: "Remote",
        duration: "Ongoing",
        status: "Open"
      }
    ];

    setOpportunities(sampleData);
    setFilteredOpps(sampleData);
  }, []);

  const applyFilters = () => {
    const filtered = opportunities.filter((opp) => {
      const skillMatch =
        !skillSearch ||
        opp.required_skills.some((skill) =>
          skill.toLowerCase().includes(skillSearch.toLowerCase())
        );

      const locationMatch =
        !locationSearch ||
        opp.location.toLowerCase().includes(locationSearch.toLowerCase());

      const statusMatch =
        statusFilter === "All" || opp.status === statusFilter;

      return skillMatch && locationMatch && statusMatch;
    });

    setFilteredOpps(filtered);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const resetFilters = () => {
    setSkillSearch("");
    setLocationSearch("");
    setStatusFilter("Open");
    setFilteredOpps(opportunities);
  };

  const allSkills = [...new Set(opportunities.flatMap(o => o.required_skills))];
  const allLocations = [...new Set(opportunities.map(o => o.location))];

  return (
    <div className="page">

      <h1>Volunteering Opportunities</h1>
      <p>Find opportunities that match your skills and interests</p>

      {/* FILTER BOX */}
      <div className="filter-box">

        <div className="filter-row">

          {/* SKILL SEARCH */}
          <div className="filter-group">
            <label>Skills</label>

            <div className="search-input">
              <Search size={16} />
              <input
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div className="chips">
              {allSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setSkillSearch(skill);
                    setTimeout(applyFilters, 100);
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* LOCATION */}
          <div className="filter-group">
            <label>Location</label>

            <div className="search-input">
              <Search size={16} />
              <input
                placeholder="Search location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div className="chips">
              {allLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocationSearch(loc);
                    setTimeout(applyFilters, 100);
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* STATUS */}
          <div className="filter-group status">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTimeout(applyFilters, 100);
              }}
            >
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

        </div>

        <div className="reset-row">
          <button onClick={resetFilters}>Reset Filters</button>
        </div>

      </div>

      {/* OPPORTUNITY LIST */}

      {filteredOpps.length === 0 ? (
        <p className="center">No opportunities found.</p>
      ) : (
        filteredOpps.map((opp) => (
          <div key={opp.id} className="card">

            <div className="card-top">
              <div>
                <h3>{opp.title}</h3>
                <p className="ngo">{opp.ngo}</p>
              </div>

              <span className="status">{opp.status}</span>
            </div>

            <p>{opp.description}</p>

            <div className="skills">
              {opp.required_skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>

            <div className="card-bottom">

              <div className="info">
                <span><MapPin size={14}/> {opp.location}</span>
                <span><Clock size={14}/> {opp.duration}</span>
              </div>

              <button className="apply">Apply</button>

            </div>

          </div>
        ))
      )}

    </div>
  );
};

export default VolunteerOpportunities;