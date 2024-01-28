import "./PriceCalcWidget.css";

export default function PriceCalcWidget() {
  return (
    <div className="price-calculator-widget">
      <h1 className="widget-title">PriceCalcWidget Bucharest</h1>
      <div className="search-box">
        <label>
          Area
          <input type="text" className="search-input"></input>
        </label>
        <label>
          Sqm
          <input type="text" className="search-input"></input>
        </label>
        <label>
          Construction year
          <input type="text" className="search-input"></input>
        </label>
      </div>
    </div>
  );
}
