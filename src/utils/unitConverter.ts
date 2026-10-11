export interface UnitItem {
  id: string;
  name: string;
  symbol: string;
  latexSymbol: string;
  toBaseFactor?: number; // Multiply by this to get base SI unit (for linear units)
  toBase?: (val: number) => number; // Custom transformation (e.g. temperature)
  fromBase?: (val: number) => number; // Custom transformation back
  description: string;
  isSiBase?: boolean;
}

export interface UnitCategoryData {
  id: string;
  name: string;
  symbol: string;
  iconName: string;
  baseUnitId: string;
  siUnitName: string;
  siDimensionLatex: string; // e.g. \text{kg}\cdot\text{m}^2/\text{s}^2
  description: string;
  units: UnitItem[];
  presets: {
    label: string;
    fromValue: number;
    fromUnitId: string;
    toUnitId: string;
    context: string;
  }[];
}

export const UNIT_CATEGORIES: UnitCategoryData[] = [
  {
    id: 'speed',
    name: 'Velocity & Speed',
    symbol: 'v',
    iconName: 'Activity',
    baseUnitId: 'm_s',
    siUnitName: 'Meters per second (m/s)',
    siDimensionLatex: '\\text{m}\\cdot\\text{s}^{-1}',
    description: 'Rate of change of position with respect to time. Coherent SI unit is m/s.',
    units: [
      {
        id: 'm_s',
        name: 'Meters per second',
        symbol: 'm/s',
        latexSymbol: '\\text{m/s}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'Standard SI unit. Used in all standard kinematic formulas (v = u + at).',
      },
      {
        id: 'km_h',
        name: 'Kilometers per hour',
        symbol: 'km/h',
        latexSymbol: '\\text{km/h}',
        toBaseFactor: 1 / 3.6, // 1000/3600 = 1/3.6
        description: 'Everyday vehicle speed unit. 1 m/s = 3.6 km/h (Rule of 3.6).',
      },
      {
        id: 'mph',
        name: 'Miles per hour',
        symbol: 'mph',
        latexSymbol: '\\text{mph}',
        toBaseFactor: 0.44704, // 1609.344 / 3600
        description: 'Imperial speed unit. 60 mph ≈ 26.82 m/s ≈ 96.56 km/h.',
      },
      {
        id: 'ft_s',
        name: 'Feet per second',
        symbol: 'ft/s',
        latexSymbol: '\\text{ft/s}',
        toBaseFactor: 0.3048,
        description: 'Common in US engineering mechanics. 1 ft/s = 0.3048 m/s.',
      },
      {
        id: 'cm_s',
        name: 'Centimeters per second',
        symbol: 'cm/s',
        latexSymbol: '\\text{cm/s}',
        toBaseFactor: 0.01,
        description: 'CGS unit of velocity. 100 cm/s = 1 m/s.',
      },
      {
        id: 'knot',
        name: 'Knots (Nautical miles/h)',
        symbol: 'kn',
        latexSymbol: '\\text{kn}',
        toBaseFactor: 0.514444,
        description: 'Used in maritime and aviation navigation. 1 knot = 1.852 km/h.',
      },
      {
        id: 'mach',
        name: 'Mach (at sea level, 15°C)',
        symbol: 'M',
        latexSymbol: '\\text{Mach}',
        toBaseFactor: 340.29,
        description: 'Speed of sound in dry air at 15°C (288.15 K) sea level ≈ 340.3 m/s.',
      },
      {
        id: 'c',
        name: 'Speed of light in vacuum',
        symbol: 'c',
        latexSymbol: 'c',
        toBaseFactor: 299792458,
        description: 'Universal physical constant: c = 299,792,458 m/s ≈ 3.00 × 10⁸ m/s.',
      },
    ],
    presets: [
      {
        label: 'Highway Speed: 100 km/h → m/s',
        fromValue: 100,
        fromUnitId: 'km_h',
        toUnitId: 'm_s',
        context: 'Standard highway cruise speed; crucial conversion for braking distance problems.',
      },
      {
        label: 'US Highway: 60 mph → m/s',
        fromValue: 60,
        fromUnitId: 'mph',
        toUnitId: 'm_s',
        context: 'Common US physics problem initial speed (60 mph = 26.82 m/s).',
      },
      {
        label: 'Supersonic Jet: Mach 2 → km/h',
        fromValue: 2,
        fromUnitId: 'mach',
        toUnitId: 'km_h',
        context: 'Supersonic aircraft travelling at twice the local speed of sound.',
      },
      {
        label: 'Olympic Sprint: 10 m/s → km/h',
        fromValue: 10,
        fromUnitId: 'm_s',
        toUnitId: 'km_h',
        context: 'Usain Bolt peak 100m sprint average speed (10 m/s = 36 km/h).',
      },
    ],
  },
  {
    id: 'energy',
    name: 'Energy, Work & Heat',
    symbol: 'E, W',
    iconName: 'Zap',
    baseUnitId: 'joule',
    siUnitName: 'Joules (J = N·m = kg·m²/s²)',
    siDimensionLatex: '\\text{kg}\\cdot\\text{m}^2\\cdot\\text{s}^{-2}',
    description: 'Capacity to do mechanical work or transfer thermal energy. SI unit is the Joule.',
    units: [
      {
        id: 'joule',
        name: 'Joule',
        symbol: 'J',
        latexSymbol: '\\text{J}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI derived unit: 1 J is the work done by 1 N force over 1 m displacement.',
      },
      {
        id: 'kj',
        name: 'Kilojoule',
        symbol: 'kJ',
        latexSymbol: '\\text{kJ}',
        toBaseFactor: 1000,
        description: '1,000 Joules. Common in thermodynamics and chemistry enthalpy values.',
      },
      {
        id: 'mj',
        name: 'Megajoule',
        symbol: 'MJ',
        latexSymbol: '\\text{MJ}',
        toBaseFactor: 1000000,
        description: '1,000,000 Joules. Typical kinetic energy of a fast-moving motor vehicle.',
      },
      {
        id: 'calorie',
        name: 'Calorie (thermochemical, cal)',
        symbol: 'cal',
        latexSymbol: '\\text{cal}',
        toBaseFactor: 4.184,
        description: 'Heat required to raise 1 gram of water by 1 °C. Defined exactly as 4.184 J.',
      },
      {
        id: 'kcal',
        name: 'Kilocalorie / Food Calorie (Cal)',
        symbol: 'kcal (Cal)',
        latexSymbol: '\\text{kcal}',
        toBaseFactor: 4184,
        description: '1 nutritional Calorie (with capital C) = 1,000 cal = 4,184 J = 4.184 kJ.',
      },
      {
        id: 'ev',
        name: 'Electron-volt',
        symbol: 'eV',
        latexSymbol: '\\text{eV}',
        toBaseFactor: 1.602176634e-19,
        description: 'Work done moving elementary charge e through 1 Volt: 1.602 × 10⁻¹⁹ J.',
      },
      {
        id: 'mev',
        name: 'Mega-electron-volt',
        symbol: 'MeV',
        latexSymbol: '\\text{MeV}',
        toBaseFactor: 1.602176634e-13,
        description: '10⁶ eV. Standard unit for nuclear binding energy and particle physics.',
      },
      {
        id: 'kwh',
        name: 'Kilowatt-hour',
        symbol: 'kWh',
        latexSymbol: '\\text{kWh}',
        toBaseFactor: 3600000, // 1000 W * 3600 s
        description: 'Commercial electricity billing unit: 1 kW × 1 hour = 3.6 × 10⁶ J (3.6 MJ).',
      },
      {
        id: 'ft_lb',
        name: 'Foot-pound force',
        symbol: 'ft·lbf',
        latexSymbol: '\\text{ft}\\cdot\\text{lbf}',
        toBaseFactor: 1.3558179483314,
        description: 'US customary unit of work/energy: 1 ft·lbf ≈ 1.3558 Joules.',
      },
      {
        id: 'btu',
        name: 'British Thermal Unit (BTU)',
        symbol: 'BTU',
        latexSymbol: '\\text{BTU}',
        toBaseFactor: 1055.06,
        description: 'Energy to raise 1 lb of water by 1 °F ≈ 1055.06 Joules.',
      },
      {
        id: 'erg',
        name: 'Erg (CGS unit)',
        symbol: 'erg',
        latexSymbol: '\\text{erg}',
        toBaseFactor: 1e-7,
        description: 'CGS unit: 1 dyne · cm = 10⁻⁷ Joules.',
      },
    ],
    presets: [
      {
        label: 'Energy in Snack: 250 kcal → Joules (kJ)',
        fromValue: 250,
        fromUnitId: 'kcal',
        toUnitId: 'kj',
        context: 'A 250 Calorie snack releases 1,046 kJ of metabolic energy.',
      },
      {
        label: 'Electricity Unit: 1 kWh → Joules (MJ)',
        fromValue: 1,
        fromUnitId: 'kwh',
        toUnitId: 'mj',
        context: '1 kilowatt-hour of household electric energy = exactly 3.6 Megajoules.',
      },
      {
        label: 'Photon Energy: 2.5 eV → Joules',
        fromValue: 2.5,
        fromUnitId: 'ev',
        toUnitId: 'joule',
        context: 'Green light photon energy (~2.5 eV = 4.005 × 10⁻¹⁹ J).',
      },
      {
        label: 'Work in SI: 500 Joules → Calories',
        fromValue: 500,
        fromUnitId: 'joule',
        toUnitId: 'calorie',
        context: 'Converting mechanical work done into thermal calorie equivalent (500 J / 4.184).',
      },
    ],
  },
  {
    id: 'force',
    name: 'Force & Weight',
    symbol: 'F, W',
    iconName: 'Sliders',
    baseUnitId: 'newton',
    siUnitName: 'Newtons (N = kg·m/s²)',
    siDimensionLatex: '\\text{kg}\\cdot\\text{m}\\cdot\\text{s}^{-2}',
    description: 'An interaction that causes a mass to accelerate (F = ma). SI unit is the Newton.',
    units: [
      {
        id: 'newton',
        name: 'Newton',
        symbol: 'N',
        latexSymbol: '\\text{N}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI coherent unit. Force needed to accelerate 1 kg at 1 m/s².',
      },
      {
        id: 'kn',
        name: 'Kilonewton',
        symbol: 'kN',
        latexSymbol: '\\text{kN}',
        toBaseFactor: 1000,
        description: '1,000 Newtons. Used for civil structures, vehicle thrust, and rocket engines.',
      },
      {
        id: 'lbf',
        name: 'Pound-force',
        symbol: 'lbf',
        latexSymbol: '\\text{lbf}',
        toBaseFactor: 4.4482216152605,
        description: 'Gravitational force exerted on 1 lb mass on Earth: 1 lbf ≈ 4.448 N.',
      },
      {
        id: 'dyne',
        name: 'Dyne (CGS unit)',
        symbol: 'dyn',
        latexSymbol: '\\text{dyn}',
        toBaseFactor: 1e-5,
        description: 'CGS unit: Force to accelerate 1 g at 1 cm/s² (10⁻⁵ N).',
      },
      {
        id: 'kgf',
        name: 'Kilogram-force (Kilopond, kp)',
        symbol: 'kgf',
        latexSymbol: '\\text{kgf}',
        toBaseFactor: 9.80665,
        description: 'Weight of 1 kg mass under standard gravity g₀: 1 kgf = 9.80665 N.',
      },
      {
        id: 'ozf',
        name: 'Ounce-force',
        symbol: 'ozf',
        latexSymbol: '\\text{ozf}',
        toBaseFactor: 0.27801385,
        description: '1/16 of a pound-force ≈ 0.278 N.',
      },
    ],
    presets: [
      {
        label: 'Weight of 100 lbf → Newtons',
        fromValue: 100,
        fromUnitId: 'lbf',
        toUnitId: 'newton',
        context: 'Converting US weight measurement to SI Newtons (100 lbf ≈ 444.82 N).',
      },
      {
        label: 'Weight of 1 kg on Earth: 1 kgf → Newtons',
        fromValue: 1,
        fromUnitId: 'kgf',
        toUnitId: 'newton',
        context: 'Exact gravitational force on 1 kg mass under g = 9.80665 m/s².',
      },
      {
        label: 'Rocket Thrust: 25 kN → Newtons',
        fromValue: 25,
        fromUnitId: 'kn',
        toUnitId: 'newton',
        context: 'Converting large aerospace thrust vectors to base Newtons (25,000 N).',
      },
      {
        label: 'Small Surface Tension: 50,000 dynes → Newtons',
        fromValue: 50000,
        fromUnitId: 'dyne',
        toUnitId: 'newton',
        context: 'Converting CGS micro-forces to SI Newtons (0.5 N).',
      },
    ],
  },
  {
    id: 'power',
    name: 'Power',
    symbol: 'P',
    iconName: 'Zap',
    baseUnitId: 'watt',
    siUnitName: 'Watts (W = J/s = kg·m²/s³)',
    siDimensionLatex: '\\text{kg}\\cdot\\text{m}^2\\cdot\\text{s}^{-3}',
    description: 'Rate at which work is performed or energy is transformed (P = W/t = F·v).',
    units: [
      {
        id: 'watt',
        name: 'Watt',
        symbol: 'W',
        latexSymbol: '\\text{W}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI derived unit: 1 Watt = 1 Joule per second (1 J/s).',
      },
      {
        id: 'kw',
        name: 'Kilowatt',
        symbol: 'kW',
        latexSymbol: '\\text{kW}',
        toBaseFactor: 1000,
        description: '1,000 Watts. Standard unit for electrical appliance consumption and car motors.',
      },
      {
        id: 'mw',
        name: 'Megawatt',
        symbol: 'MW',
        latexSymbol: '\\text{MW}',
        toBaseFactor: 1000000,
        description: '1,000,000 Watts. Power output of electrical generating turbines and power plants.',
      },
      {
        id: 'hp_mech',
        name: 'Horsepower (Mechanical / Imperial hp)',
        symbol: 'hp',
        latexSymbol: '\\text{hp}',
        toBaseFactor: 745.69987158227022,
        description: 'James Watt defined imperial unit: 550 ft·lbf/s ≈ 745.7 Watts.',
      },
      {
        id: 'hp_metric',
        name: 'Horsepower (Metric PS / cv)',
        symbol: 'PS (hp)',
        latexSymbol: '\\text{PS}',
        toBaseFactor: 735.49875,
        description: 'Metric horsepower: 75 kgf·m/s = exactly 735.49875 Watts.',
      },
      {
        id: 'ft_lb_s',
        name: 'Foot-pounds per second',
        symbol: 'ft·lb/s',
        latexSymbol: '\\text{ft}\\cdot\\text{lb/s}',
        toBaseFactor: 1.355818,
        description: 'Imperial rate of mechanical work: 1 hp = 550 ft·lb/s.',
      },
      {
        id: 'btu_h',
        name: 'BTU per hour',
        symbol: 'BTU/h',
        latexSymbol: '\\text{BTU/h}',
        toBaseFactor: 0.293071,
        description: 'Standard HVAC heating and air conditioning cooling rating.',
      },
      {
        id: 'cal_s',
        name: 'Calories per second',
        symbol: 'cal/s',
        latexSymbol: '\\text{cal/s}',
        toBaseFactor: 4.184,
        description: 'Thermal energy transfer rate: 1 cal/s = 4.184 W.',
      },
    ],
    presets: [
      {
        label: 'Car Engine: 200 hp → Kilowatts (kW)',
        fromValue: 200,
        fromUnitId: 'hp_mech',
        toUnitId: 'kw',
        context: '200 horsepower internal combustion engine produces ~149.14 kW of peak power.',
      },
      {
        label: 'Home Solar: 5 kW → Horsepower',
        fromValue: 5,
        fromUnitId: 'kw',
        toUnitId: 'hp_mech',
        context: '5 kW residential solar inverter system output (~6.7 hp).',
      },
      {
        label: 'AC Cooling: 12,000 BTU/h → Watts',
        fromValue: 12000,
        fromUnitId: 'btu_h',
        toUnitId: 'watt',
        context: '1-Ton air conditioning cooling capacity (12,000 BTU/h ≈ 3,517 W = 3.52 kW).',
      },
    ],
  },
  {
    id: 'distance',
    name: 'Distance & Length',
    symbol: 'd, x, s',
    iconName: 'Compass',
    baseUnitId: 'meter',
    siUnitName: 'Meters (m)',
    siDimensionLatex: '\\text{m}',
    description: 'Spatial separation or displacement between two points. Fundamental SI base unit is the meter.',
    units: [
      {
        id: 'meter',
        name: 'Meter',
        symbol: 'm',
        latexSymbol: '\\text{m}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI fundamental base unit of length: distance light travels in 1/299,792,458 s.',
      },
      {
        id: 'km',
        name: 'Kilometer',
        symbol: 'km',
        latexSymbol: '\\text{km}',
        toBaseFactor: 1000,
        description: '1,000 meters. Standard geographic and road distance unit.',
      },
      {
        id: 'cm',
        name: 'Centimeter',
        symbol: 'cm',
        latexSymbol: '\\text{cm}',
        toBaseFactor: 0.01,
        description: '1/100 of a meter. Common laboratory scale measurement.',
      },
      {
        id: 'mm',
        name: 'Millimeter',
        symbol: 'mm',
        latexSymbol: '\\text{mm}',
        toBaseFactor: 0.001,
        description: '1/1,000 of a meter. Mechanical engineering tolerance scale.',
      },
      {
        id: 'um',
        name: 'Micrometer (Micron)',
        symbol: 'µm',
        latexSymbol: '\\mu\\text{m}',
        toBaseFactor: 1e-6,
        description: '10⁻⁶ meters. Optical wavelengths and cell biology scale.',
      },
      {
        id: 'nm',
        name: 'Nanometer',
        symbol: 'nm',
        latexSymbol: '\\text{nm}',
        toBaseFactor: 1e-9,
        description: '10⁻⁹ meters. Visible light spectrum ranges from 380 nm to 750 nm.',
      },
      {
        id: 'ft',
        name: 'Foot',
        symbol: 'ft',
        latexSymbol: '\\text{ft}',
        toBaseFactor: 0.3048,
        description: '12 inches = exactly 0.3048 meters.',
      },
      {
        id: 'inch',
        name: 'Inch',
        symbol: 'in',
        latexSymbol: '\\text{in}',
        toBaseFactor: 0.0254,
        description: 'Defined exactly as 25.4 mm (0.0254 m).',
      },
      {
        id: 'yd',
        name: 'Yard',
        symbol: 'yd',
        latexSymbol: '\\text{yd}',
        toBaseFactor: 0.9144,
        description: '3 feet = exactly 0.9144 meters.',
      },
      {
        id: 'mile',
        name: 'Mile (Statute mile)',
        symbol: 'mi',
        latexSymbol: '\\text{mi}',
        toBaseFactor: 1609.344,
        description: '5,280 feet = exactly 1,609.344 meters.',
      },
      {
        id: 'nmi',
        name: 'Nautical Mile',
        symbol: 'nmi',
        latexSymbol: '\\text{nmi}',
        toBaseFactor: 1852,
        description: 'Defined exactly as 1,852 meters (approx. 1 minute of latitude).',
      },
      {
        id: 'au',
        name: 'Astronomical Unit',
        symbol: 'AU',
        latexSymbol: '\\text{AU}',
        toBaseFactor: 149597870700,
        description: 'Mean distance from Earth to Sun: 1.496 × 10¹¹ m.',
      },
      {
        id: 'ly',
        name: 'Light-Year',
        symbol: 'ly',
        latexSymbol: '\\text{ly}',
        toBaseFactor: 9.4607304725808e15,
        description: 'Distance light travels in 1 Julian year: 9.461 × 10¹⁵ m.',
      },
    ],
    presets: [
      {
        label: 'Marathon Race: 26.21875 mi → km',
        fromValue: 26.21875,
        fromUnitId: 'mile',
        toUnitId: 'km',
        context: 'Official marathon race distance equals 42.195 km.',
      },
      {
        label: 'Visible Light: 550 nm → Meters',
        fromValue: 550,
        fromUnitId: 'nm',
        toUnitId: 'meter',
        context: 'Yellow-green peak solar light wavelength (5.5 × 10⁻⁷ m).',
      },
      {
        label: 'Flight Altitude: 35,000 ft → Meters',
        fromValue: 35000,
        fromUnitId: 'ft',
        toUnitId: 'meter',
        context: 'Standard commercial jet cruise altitude (10,668 m ≈ 10.7 km).',
      },
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    symbol: 'm',
    iconName: 'Atom',
    baseUnitId: 'kg',
    siUnitName: 'Kilograms (kg)',
    siDimensionLatex: '\\text{kg}',
    description: 'Fundamental measure of the amount of matter and inertia in an object.',
    units: [
      {
        id: 'kg',
        name: 'Kilogram',
        symbol: 'kg',
        latexSymbol: '\\text{kg}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI fundamental base unit of mass. Defined via Planck constant h.',
      },
      {
        id: 'g',
        name: 'Gram',
        symbol: 'g',
        latexSymbol: '\\text{g}',
        toBaseFactor: 0.001,
        description: '1/1,000 of a kilogram. Standard laboratory chemistry mass unit.',
      },
      {
        id: 'mg',
        name: 'Milligram',
        symbol: 'mg',
        latexSymbol: '\\text{mg}',
        toBaseFactor: 1e-6,
        description: '10⁻⁶ kilograms (1/1,000 of a gram).',
      },
      {
        id: 'ton_metric',
        name: 'Metric Ton (Tonne, t)',
        symbol: 't',
        latexSymbol: '\\text{t}',
        toBaseFactor: 1000,
        description: '1,000 kg. Used for vehicle masses and industrial freight.',
      },
      {
        id: 'lb_mass',
        name: 'Pound (Avoirdupois lb)',
        symbol: 'lb',
        latexSymbol: '\\text{lb}',
        toBaseFactor: 0.45359237,
        description: 'Defined internationally as exactly 0.45359237 kg.',
      },
      {
        id: 'oz_mass',
        name: 'Ounce (oz)',
        symbol: 'oz',
        latexSymbol: '\\text{oz}',
        toBaseFactor: 0.028349523125,
        description: '1/16 of a pound = 28.35 grams.',
      },
      {
        id: 'amu',
        name: 'Atomic Mass Unit (u / Da)',
        symbol: 'u',
        latexSymbol: '\\text{u}',
        toBaseFactor: 1.6605390666e-27,
        description: '1/12 the mass of carbon-12 atom = 1.6605 × 10⁻²⁷ kg.',
      },
      {
        id: 'slug',
        name: 'Slug (Imperial mass unit)',
        symbol: 'slug',
        latexSymbol: '\\text{slug}',
        toBaseFactor: 14.593903,
        description: 'Mass accelerated at 1 ft/s² by 1 lbf: 1 slug ≈ 14.59 kg.',
      },
    ],
    presets: [
      {
        label: 'Human Body Mass: 150 lb → kg',
        fromValue: 150,
        fromUnitId: 'lb_mass',
        toUnitId: 'kg',
        context: '150 lb body weight translates to ~68.04 kg mass in SI calculations.',
      },
      {
        label: 'Proton Mass: 1.007276 u → kg',
        fromValue: 1.007276,
        fromUnitId: 'amu',
        toUnitId: 'kg',
        context: 'Nuclear physics conversion (1.6726 × 10⁻²⁷ kg).',
      },
      {
        label: 'Automobile Mass: 1.5 tons → kg',
        fromValue: 1.5,
        fromUnitId: 'ton_metric',
        toUnitId: 'kg',
        context: 'Standard passenger car mass = 1,500 kg.',
      },
    ],
  },
  {
    id: 'acceleration',
    name: 'Acceleration',
    symbol: 'a',
    iconName: 'Activity',
    baseUnitId: 'm_s2',
    siUnitName: 'Meters per second squared (m/s²)',
    siDimensionLatex: '\\text{m}\\cdot\\text{s}^{-2}',
    description: 'Rate of change of velocity over time (a = Δv/Δt).',
    units: [
      {
        id: 'm_s2',
        name: 'Meters per second squared',
        symbol: 'm/s²',
        latexSymbol: '\\text{m/s}^2',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI derived coherent unit of acceleration.',
      },
      {
        id: 'g_earth',
        name: 'Standard Earth Gravity (g₀)',
        symbol: 'g',
        latexSymbol: 'g',
        toBaseFactor: 9.80665,
        description: 'Standard sea-level gravitational acceleration: 9.80665 m/s².',
      },
      {
        id: 'ft_s2',
        name: 'Feet per second squared',
        symbol: 'ft/s²',
        latexSymbol: '\\text{ft/s}^2',
        toBaseFactor: 0.3048,
        description: 'US customary acceleration unit. 1 g ≈ 32.174 ft/s².',
      },
      {
        id: 'km_h_s',
        name: 'Kilometers per hour per second',
        symbol: 'km/(h·s)',
        latexSymbol: '\\text{km}/(\\text{h}\\cdot\\text{s})',
        toBaseFactor: 1 / 3.6,
        description: 'Automotive acceleration measure: (e.g. 0 to 100 km/h in 5 s = 20 km/(h·s)).',
      },
      {
        id: 'mph_s',
        name: 'Miles per hour per second',
        symbol: 'mph/s',
        latexSymbol: '\\text{mph/s}',
        toBaseFactor: 0.44704,
        description: 'Vehicle acceleration rate in mph gained per second.',
      },
      {
        id: 'gal',
        name: 'Galileo (Gal / cm/s²)',
        symbol: 'Gal',
        latexSymbol: '\\text{Gal}',
        toBaseFactor: 0.01,
        description: 'Gravimetry unit: 1 Gal = 1 cm/s² = 0.01 m/s².',
      },
    ],
    presets: [
      {
        label: 'Rollercoaster Peak: 4.5 g → m/s²',
        fromValue: 4.5,
        fromUnitId: 'g_earth',
        toUnitId: 'm_s2',
        context: 'High-G coaster maneuver acceleration (4.5 g ≈ 44.13 m/s²).',
      },
      {
        label: 'Gravity in US Units: 1 g → ft/s²',
        fromValue: 1,
        fromUnitId: 'g_earth',
        toUnitId: 'ft_s2',
        context: 'Standard gravity expressed in feet/s² (32.174 ft/s²).',
      },
      {
        label: '0 to 100 km/h in 4.0s: 25 km/(h·s) → m/s²',
        fromValue: 25,
        fromUnitId: 'km_h_s',
        toUnitId: 'm_s2',
        context: 'Sports car linear acceleration = 6.94 m/s².',
      },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    symbol: 'P, p',
    iconName: 'Sliders',
    baseUnitId: 'pascal',
    siUnitName: 'Pascals (Pa = N/m² = kg/(m·s²))',
    siDimensionLatex: '\\text{N}/\\text{m}^2 = \\text{kg}\\cdot\\text{m}^{-1}\\cdot\\text{s}^{-2}',
    description: 'Force applied perpendicular to a surface per unit area (P = F/A).',
    units: [
      {
        id: 'pascal',
        name: 'Pascal',
        symbol: 'Pa',
        latexSymbol: '\\text{Pa}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI derived unit: 1 Pa = 1 Newton per square meter.',
      },
      {
        id: 'kpa',
        name: 'Kilopascal',
        symbol: 'kPa',
        latexSymbol: '\\text{kPa}',
        toBaseFactor: 1000,
        description: '1,000 Pa. Standard meteorological and fluid mechanics scale.',
      },
      {
        id: 'mpa',
        name: 'Megapascal',
        symbol: 'MPa',
        latexSymbol: '\\text{MPa}',
        toBaseFactor: 1000000,
        description: '1,000,000 Pa (1 N/mm²). Used for material tensile strength and Young’s modulus.',
      },
      {
        id: 'atm',
        name: 'Standard Atmosphere',
        symbol: 'atm',
        latexSymbol: '\\text{atm}',
        toBaseFactor: 101325,
        description: 'Mean sea level atmospheric pressure = exactly 101,325 Pa = 101.325 kPa.',
      },
      {
        id: 'bar',
        name: 'Bar',
        symbol: 'bar',
        latexSymbol: '\\text{bar}',
        toBaseFactor: 100000,
        description: 'Defined exactly as 100,000 Pa = 100 kPa ≈ 0.987 atm.',
      },
      {
        id: 'psi',
        name: 'Pounds per square inch',
        symbol: 'psi (lbf/in²)',
        latexSymbol: '\\text{psi}',
        toBaseFactor: 6894.757293168,
        description: 'Common US tire and pressure vessel rating: 1 atm ≈ 14.696 psi.',
      },
      {
        id: 'torr',
        name: 'Torr (mmHg)',
        symbol: 'Torr / mmHg',
        latexSymbol: '\\text{Torr}',
        toBaseFactor: 133.322368421,
        description: '1/760 of standard atmosphere ≈ pressure exerted by 1 mm mercury column.',
      },
    ],
    presets: [
      {
        label: 'Atmospheric Pressure: 1 atm → kPa',
        fromValue: 1,
        fromUnitId: 'atm',
        toUnitId: 'kpa',
        context: '1 atmosphere at sea level equals 101.325 kPa.',
      },
      {
        label: 'Car Tire Pressure: 32 psi → kPa',
        fromValue: 32,
        fromUnitId: 'psi',
        toUnitId: 'kpa',
        context: 'Standard passenger vehicle tire pressure (32 psi ≈ 220.6 kPa).',
      },
      {
        label: 'Blood Pressure: 120 mmHg → kPa',
        fromValue: 120,
        fromUnitId: 'torr',
        toUnitId: 'kpa',
        context: 'Typical systolic human blood pressure (120 mmHg = 16.0 kPa).',
      },
    ],
  },
  {
    id: 'angle',
    name: 'Angle & Angular Velocity',
    symbol: 'θ, ω',
    iconName: 'Compass',
    baseUnitId: 'radian',
    siUnitName: 'Radians (rad)',
    siDimensionLatex: '\\text{rad (dimensionless: } \\text{m/m})',
    description: 'Rotational measure of subtended arc length over radius (θ = s/r).',
    units: [
      {
        id: 'radian',
        name: 'Radian',
        symbol: 'rad',
        latexSymbol: '\\text{rad}',
        toBaseFactor: 1,
        isSiBase: true,
        description: 'SI coherent unit: 2π radians = 1 full 360° circle revolution.',
      },
      {
        id: 'degree',
        name: 'Degree',
        symbol: '°',
        latexSymbol: '^\\circ',
        toBaseFactor: Math.PI / 180,
        description: '1/360 of a complete circle. 180° = π radians.',
      },
      {
        id: 'revolution',
        name: 'Revolution (Turn / Cycle)',
        symbol: 'rev',
        latexSymbol: '\\text{rev}',
        toBaseFactor: 2 * Math.PI,
        description: '1 complete 360° circle turn = 2π rad ≈ 6.28318 rad.',
      },
      {
        id: 'arcmin',
        name: 'Arcminute',
        symbol: 'arcmin (\')',
        latexSymbol: '\'',
        toBaseFactor: (Math.PI / 180) / 60,
        description: '1/60 of a degree. Used in astronomy and precision ballistics.',
      },
      {
        id: 'arcsec',
        name: 'Arcsecond',
        symbol: 'arcsec (")',
        latexSymbol: '\'\'',
        toBaseFactor: (Math.PI / 180) / 3600,
        description: '1/3600 of a degree. Used in stellar parallax measurements.',
      },
    ],
    presets: [
      {
        label: 'Half Circle: 180° → Radians',
        fromValue: 180,
        fromUnitId: 'degree',
        toUnitId: 'radian',
        context: '180° equals exactly π radians (3.14159 rad).',
      },
      {
        label: 'Right Angle: 90° → Radians',
        fromValue: 90,
        fromUnitId: 'degree',
        toUnitId: 'radian',
        context: '90° equals π/2 radians (1.5708 rad).',
      },
      {
        label: 'Full Turn: 1 rev → Radians',
        fromValue: 1,
        fromUnitId: 'revolution',
        toUnitId: 'radian',
        context: '1 full rotation = 2π radians (6.2832 rad).',
      },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    symbol: 'T',
    iconName: 'Zap',
    baseUnitId: 'kelvin',
    siUnitName: 'Kelvin (K)',
    siDimensionLatex: '\\text{K}',
    description: 'Thermodynamic measure of average thermal kinetic energy per particle.',
    units: [
      {
        id: 'kelvin',
        name: 'Kelvin',
        symbol: 'K',
        latexSymbol: '\\text{K}',
        toBase: (v) => v,
        fromBase: (b) => b,
        isSiBase: true,
        description: 'SI fundamental base unit. Absolute zero = 0 K (-273.15 °C).',
      },
      {
        id: 'celsius',
        name: 'Celsius',
        symbol: '°C',
        latexSymbol: '^\\circ\\text{C}',
        toBase: (v) => v + 273.15,
        fromBase: (b) => b - 273.15,
        description: 'Water freezing point: 0 °C (273.15 K), boiling point: 100 °C (373.15 K).',
      },
      {
        id: 'fahrenheit',
        name: 'Fahrenheit',
        symbol: '°F',
        latexSymbol: '^\\circ\\text{F}',
        toBase: (v) => (v - 32) * (5 / 9) + 273.15,
        fromBase: (b) => (b - 273.15) * (9 / 5) + 32,
        description: 'US scale: Water freezes at 32 °F and boils at 212 °F.',
      },
    ],
    presets: [
      {
        label: 'Water Boiling: 100 °C → Kelvin',
        fromValue: 100,
        fromUnitId: 'celsius',
        toUnitId: 'kelvin',
        context: '100 °C = 100 + 273.15 = 373.15 K.',
      },
      {
        label: 'Room Temperature: 20 °C → Fahrenheit',
        fromValue: 20,
        fromUnitId: 'celsius',
        toUnitId: 'fahrenheit',
        context: 'Standard physics lab temperature (20 °C = 68 °F = 293.15 K).',
      },
      {
        label: 'Human Body: 98.6 °F → Celsius',
        fromValue: 98.6,
        fromUnitId: 'fahrenheit',
        toUnitId: 'celsius',
        context: 'Average human body temperature (98.6 °F = 37.0 °C = 310.15 K).',
      },
      {
        label: 'Absolute Zero: -273.15 °C → Kelvin',
        fromValue: -273.15,
        fromUnitId: 'celsius',
        toUnitId: 'kelvin',
        context: 'Theoretical minimum temperature where molecular motion ceases (0 K).',
      },
    ],
  },
];

export interface ConversionStepResult {
  categoryId: string;
  fromUnit: UnitItem;
  toUnit: UnitItem;
  inputValue: number;
  outputValue: number;
  factorToSi: number | null;
  factorFromSi: number | null;
  ratioDirect: number | null;
  latexDimensionalAnalysis: string;
  latexDirectFormula: string;
  explanation: string;
  scientificNotation: string;
}

export function convertPhysicsUnit(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategoryData
): number {
  if (isNaN(value)) return 0;
  const from = category.units.find((u) => u.id === fromUnitId);
  const to = category.units.find((u) => u.id === toUnitId);
  if (!from || !to) return value;

  // Temperature affine conversions
  if (category.id === 'temperature') {
    const toBaseFn = from.toBase || ((v: number) => v);
    const fromBaseFn = to.fromBase || ((b: number) => b);
    const inKelvin = toBaseFn(value);
    return fromBaseFn(inKelvin);
  }

  // Linear ratio conversions
  const fromFactor = from.toBaseFactor ?? 1;
  const toFactor = to.toBaseFactor ?? 1;
  const baseValue = value * fromFactor;
  return baseValue / toFactor;
}

export function generateDimensionalAnalysis(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategoryData
): ConversionStepResult {
  const from = category.units.find((u) => u.id === fromUnitId) || category.units[0];
  const to = category.units.find((u) => u.id === toUnitId) || category.units[1] || category.units[0];
  const outputValue = convertPhysicsUnit(value, from.id, to.id, category);

  // Format scientific notation
  let scientificNotation = outputValue.toExponential(4);
  if (Math.abs(outputValue) < 1e6 && Math.abs(outputValue) > 1e-4 && outputValue !== 0) {
    scientificNotation = outputValue.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }

  // Handle temperature separately
  if (category.id === 'temperature') {
    let latexDirectFormula = '';
    let explanation = '';
    if (from.id === 'celsius' && to.id === 'kelvin') {
      latexDirectFormula = `T_{\\text{K}} = T_{^\\circ\\text{C}} + 273.15 = ${value} + 273.15 = ${outputValue.toFixed(2)}\\text{ K}`;
      explanation = `Add 273.15 to convert Celsius to thermodynamic Kelvin.`;
    } else if (from.id === 'kelvin' && to.id === 'celsius') {
      latexDirectFormula = `T_{^\\circ\\text{C}} = T_{\\text{K}} - 273.15 = ${value} - 273.15 = ${outputValue.toFixed(2)}^\\circ\\text{C}`;
      explanation = `Subtract 273.15 from Kelvin to obtain degrees Celsius.`;
    } else if (from.id === 'fahrenheit' && to.id === 'celsius') {
      latexDirectFormula = `T_{^\\circ\\text{C}} = \\frac{5}{9}(T_{^\\circ\\text{F}} - 32) = \\frac{5}{9}(${value} - 32) = ${outputValue.toFixed(2)}^\\circ\\text{C}`;
      explanation = `Subtract 32 and scale by 5/9.`;
    } else if (from.id === 'celsius' && to.id === 'fahrenheit') {
      latexDirectFormula = `T_{^\\circ\\text{F}} = \\left(T_{^\\circ\\text{C}} \\times \\frac{9}{5}\\right) + 32 = \\left(${value} \\times \\frac{9}{5}\\right) + 32 = ${outputValue.toFixed(2)}^\\circ\\text{F}`;
      explanation = `Multiply by 9/5 and add 32.`;
    } else if (from.id === 'fahrenheit' && to.id === 'kelvin') {
      latexDirectFormula = `T_{\\text{K}} = \\frac{5}{9}(T_{^\\circ\\text{F}} - 32) + 273.15 = ${outputValue.toFixed(2)}\\text{ K}`;
      explanation = `First convert Fahrenheit to Celsius then add 273.15 to reach Kelvin.`;
    } else if (from.id === 'kelvin' && to.id === 'fahrenheit') {
      latexDirectFormula = `T_{^\\circ\\text{F}} = (T_{\\text{K}} - 273.15) \\times \\frac{9}{5} + 32 = ${outputValue.toFixed(2)}^\\circ\\text{F}`;
      explanation = `First subtract 273.15 to get Celsius, then multiply by 9/5 and add 32.`;
    } else {
      latexDirectFormula = `${value} ${from.latexSymbol} = ${outputValue} ${to.latexSymbol}`;
      explanation = `Same unit, no conversion required.`;
    }

    return {
      categoryId: category.id,
      fromUnit: from,
      toUnit: to,
      inputValue: value,
      outputValue,
      factorToSi: null,
      factorFromSi: null,
      ratioDirect: null,
      latexDimensionalAnalysis: latexDirectFormula,
      latexDirectFormula,
      explanation,
      scientificNotation,
    };
  }

  // Linear dimensional analysis (Factor-Label method)
  const fromFactor = from.toBaseFactor ?? 1;
  const toFactor = to.toBaseFactor ?? 1;
  const directRatio = fromFactor / toFactor;

  const baseUnit = category.units.find((u) => u.id === category.baseUnitId) || category.units[0];

  let latexDimensionalAnalysis = '';
  let latexDirectFormula = '';
  let explanation = '';

  // Check special high school common shortcuts
  if (category.id === 'speed' && from.id === 'km_h' && to.id === 'm_s') {
    latexDimensionalAnalysis = `${value}\\,\\text{km/h} \\times \\left(\\frac{1000\\,\\text{m}}{1\\,\\text{km}}\\right) \\times \\left(\\frac{1\\,\\text{h}}{3600\\,\\text{s}}\\right) = ${value} \\times \\frac{1}{3.6} = ${formatNumber(outputValue)}\\,\\text{m/s}`;
    latexDirectFormula = `v_{\\text{m/s}} = \\frac{v_{\\text{km/h}}}{3.6} = \\frac{${value}}{3.6} = ${formatNumber(outputValue)}\\,\\text{m/s}`;
    explanation = `Divide by 3.6 because 1 km/h = 1000 m / 3600 s = 1/3.6 m/s.`;
  } else if (category.id === 'speed' && from.id === 'm_s' && to.id === 'km_h') {
    latexDimensionalAnalysis = `${value}\\,\\text{m/s} \\times \\left(\\frac{1\\,\\text{km}}{1000\\,\\text{m}}\\right) \\times \\left(\\frac{3600\\,\\text{s}}{1\\,\\text{h}}\\right) = ${value} \\times 3.6 = ${formatNumber(outputValue)}\\,\\text{km/h}`;
    latexDirectFormula = `v_{\\text{km/h}} = v_{\\text{m/s}} \\times 3.6 = ${value} \\times 3.6 = ${formatNumber(outputValue)}\\,\\text{km/h}`;
    explanation = `Multiply by 3.6 because 1 m/s = (1/1000 km) / (1/3600 h) = 3.6 km/h.`;
  } else if (category.id === 'energy' && from.id === 'calorie' && to.id === 'joule') {
    latexDimensionalAnalysis = `${value}\\,\\text{cal} \\times \\left(\\frac{4.184\\,\\text{J}}{1\\,\\text{cal}}\\right) = ${formatNumber(outputValue)}\\,\\text{J}`;
    latexDirectFormula = `E_{\\text{J}} = E_{\\text{cal}} \\times 4.184 = ${value} \\times 4.184 = ${formatNumber(outputValue)}\\,\\text{J}`;
    explanation = `1 thermochemical calorie is defined as exactly 4.184 Joules.`;
  } else if (category.id === 'energy' && from.id === 'joule' && to.id === 'calorie') {
    latexDimensionalAnalysis = `${value}\\,\\text{J} \\times \\left(\\frac{1\\,\\text{cal}}{4.184\\,\\text{J}}\\right) = \\frac{${value}}{4.184} = ${formatNumber(outputValue)}\\,\\text{cal}`;
    latexDirectFormula = `E_{\\text{cal}} = \\frac{E_{\\text{J}}}{4.184} = \\frac{${value}}{4.184} = ${formatNumber(outputValue)}\\,\\text{cal}`;
    explanation = `Divide by 4.184 to convert Joules to calories.`;
  } else if (from.id === baseUnit.id) {
    // From base to another unit
    latexDimensionalAnalysis = `${value}\\,${from.latexSymbol} \\times \\left(\\frac{1\\,${to.latexSymbol}}{${formatFactor(toFactor)}\\,${baseUnit.latexSymbol}}\\right) = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    latexDirectFormula = `\\text{Value} = \\frac{${value}}{${formatFactor(toFactor)}} = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    explanation = `Divide the base SI value by the conversion factor (${formatFactor(toFactor)}) of 1 ${to.symbol}.`;
  } else if (to.id === baseUnit.id) {
    // From unit to base
    latexDimensionalAnalysis = `${value}\\,${from.latexSymbol} \\times \\left(\\frac{${formatFactor(fromFactor)}\\,${baseUnit.latexSymbol}}{1\\,${from.latexSymbol}}\\right) = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    latexDirectFormula = `\\text{Value} = ${value} \\times ${formatFactor(fromFactor)} = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    explanation = `Multiply by the factor (${formatFactor(fromFactor)}) since 1 ${from.symbol} = ${formatFactor(fromFactor)} ${baseUnit.symbol}.`;
  } else {
    // Between two non-base units via SI bridge
    const baseVal = value * fromFactor;
    latexDimensionalAnalysis = `${value}\\,${from.latexSymbol} \\times \\left(\\frac{${formatFactor(fromFactor)}\\,${baseUnit.latexSymbol}}{1\\,${from.latexSymbol}}\\right) \\times \\left(\\frac{1\\,${to.latexSymbol}}{${formatFactor(toFactor)}\\,${baseUnit.latexSymbol}}\\right) = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    latexDirectFormula = `\\text{Value} = ${value} \\times \\left(\\frac{${formatFactor(fromFactor)}}{${formatFactor(toFactor)}}\\right) = ${formatNumber(outputValue)}\\,${to.latexSymbol}`;
    explanation = `First convert ${from.symbol} to SI base (${baseUnit.symbol}) by multiplying by ${formatFactor(fromFactor)}, then divide by ${formatFactor(toFactor)} to obtain ${to.symbol}.`;
  }

  return {
    categoryId: category.id,
    fromUnit: from,
    toUnit: to,
    inputValue: value,
    outputValue,
    factorToSi: fromFactor,
    factorFromSi: toFactor,
    ratioDirect: directRatio,
    latexDimensionalAnalysis,
    latexDirectFormula,
    explanation,
    scientificNotation,
  };
}

function formatFactor(f: number): string {
  if (Math.abs(f) < 1e-3 || Math.abs(f) >= 1e6) {
    return f.toExponential(4).replace('e+', '\\times 10^{').replace('e-', '\\times 10^{-') + '}';
  }
  return f.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

function formatNumber(num: number): string {
  if (isNaN(num)) return '0';
  if (num === 0) return '0';
  if (Math.abs(num) < 1e-4 || Math.abs(num) >= 1e7) {
    return num.toExponential(4);
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
}
