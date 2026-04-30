import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  // Load states
  useEffect(() => {
    fetch("http://localhost:5000/states")
      .then(res => res.json())
      .then(data => setStates(data));
  }, []);

  // Handle state change
  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedDistrict("");
    setVillages([]);

    setLoading(true);
    const res = await fetch(`http://localhost:5000/districts/${stateId}`);
    const data = await res.json();
    setDistricts(data);
    setLoading(false);
  };

  // Handle district change
  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);

    setLoading(true);
    const res = await fetch(`http://localhost:5000/villages/${districtId}`);
    const data = await res.json();
    setVillages(data);
    setLoading(false);
  };

  // Search villages
  const handleSearch = async () => {
    if (!search) return;

    setLoading(true);
    const res = await fetch(`http://localhost:5000/search?q=${search}`);
    const data = await res.json();
    setVillages(data);
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Village Explorer 🚀</h1>

      {/* SEARCH */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search village..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* FILTERS */}
      <div className="controls">
        <select onChange={handleStateChange} value={selectedState}>
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select onChange={handleDistrictChange} value={selectedDistrict}>
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* VILLAGES */}
      <ul>
        {villages.map((v, i) => (
          <li key={i}>{v.village}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;