import { useState, useEffect } from 'react';
import styles from './ColorSearch.module.css'; // Import Tailwind CSS classes

const ColorSearch = () => {
  const [colors, setColors] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/NishantChandla/color-test-resources/main/xkcd-colors.json'
      );
      if (response.ok) {
        const data = await response.json();

        //colors array to include the rgb property
        const colorsWithRGB = data.colors.map((color) => ({
          ...color,
          rgb: hexToRgb(color.hex),
        }));

        setSearchResults(colorsWithRGB.slice(0, 100)); // Display default colors
        // setColors(data.colors);
        setColors(colorsWithRGB);
        console.log(colorsWithRGB)
      } else {
        setFetchError(true);
      }
    } catch (error) {
      setFetchError(true);
    }
  };


  const hexToRgb = (hex) => {
    // Remove the hash symbol if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hexadecimal value to separate RGB values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgb(${r}, ${g}, ${b})`;
  };


  const handleSearch = () => {
    setErrorMessage('');
    setFetchError(false);

    const validColorRegex = /^#([0-9A-F]{3}){1,2}$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
    if (!validColorRegex.test(searchInput)) {
      setErrorMessage('Invalid color format');
      setSearchResults([]);
      return;
    }

    const targetColor = searchInput.toLowerCase();
    const sortedColors = [...colors].sort((a, b) => {
      const aDistance = getColorDistance(a.hex, targetColor);
      const bDistance = getColorDistance(b.hex, targetColor);
      return aDistance - bDistance;
    });

    setSearchResults(sortedColors.slice(0, 100));
  };

  const getColorDistance = (color1, color2) => {
    const rgb1 = parseColor(color1);
    const rgb2 = parseColor(color2);

    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;

    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const parseColor = (color) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    } else if (color.startsWith('rgb(')) {
      const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgb) {
        return {
          r: parseInt(rgb[1]),
          g: parseInt(rgb[2]),
          b: parseInt(rgb[3]),
        };
      }
    }

    return { r: 0, g: 0, b: 0 };
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Color Search Tool</h1>
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Enter a CSS color code (e.g. “#FF0000” or “rgb(255,0,0)”)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className={styles.input}
        />
        <button onClick={handleSearch} className={styles.button}>
          Search
        </button>
      </div>

      {fetchError && (
        <div className={styles.error}>
          <p>Failed to fetch colors. Please try again.</p>
          <button onClick={fetchColors} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Hex</th>
            <th>RGB</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
        
          {searchResults.map((color) => (
            <tr key={color.color}>
              <td>{color.color}</td>
              <td>{color.hex}</td>
              <td>{color.rgb}</td>
              <td style={{backgroundColor:color.hex}}></td>
            </tr>
          ))}
          
        </tbody>
      </table>
    </div>
  );
};

export default ColorSearch;
