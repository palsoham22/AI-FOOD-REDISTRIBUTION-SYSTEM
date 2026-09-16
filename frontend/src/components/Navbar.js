import { Link } from "react-router-dom";
import { useTranslationContext } from "../context/TranslationContext";
import { useTranslate } from "../hooks/useTranslate";

function Navbar() {

  const { language, setLanguage } = useTranslationContext();

  const t = useTranslate();

  return (

    <nav className="navbar navbar-expand-lg navbar-dark bg-success">

      <div className="container">

        <Link className="navbar-brand" to="/">
          {t("FoodBridge AI")}
        </Link>

        <div className="d-flex align-items-center gap-2">

  <select
    className="form-select"
    style={{ width: "170px" }}
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
  >
    <option value="en-IN">English</option>
    <option value="hi-IN">हिन्दी</option>
    <option value="ta-IN">தமிழ்</option>
    <option value="te-IN">తెలుగు</option>
    <option value="ml-IN">മലയാളം</option>
  </select>

  <Link
    className="btn btn-light"
    to="/login"
  >
    {t("Login")}
  </Link>

  <Link
    className="btn btn-warning"
    to="/register"
  >
    {t("Register")}
  </Link>

</div>

      </div>

    </nav>

  );
}

export default Navbar;