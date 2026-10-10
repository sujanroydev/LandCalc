import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LENGTH_UNITS = ['Meter', 'Centimeter', 'Foot', 'Inch', 'Nol', 'Haat'];

const AREA_UNITS = [
  'Square Meter',
  'Square Centimeter',
  'Square Foot',
  'Square Inch',
  'Hectare',
  'Acre',
  'Bigha',
  'Kear',
  'Josti',
  'Raak',
  'Fon',
];

const AREA_FACTORS: Record<string, number> = {
  'Square Meter': 1,
  'Square Centimeter': 0.0001,
  'Square Foot': 1 / 10.7639,
  'Square Inch': 1 / 1550.0031,
  Hectare: 10000,
  Acre: 4046.86,
  Bigha: 1600,
  Kear: 0.4572 ** 2 * 8 * 8 * 4 * 28,
  Josti: 0.4572 ** 2 * 8 * 8 * 4,
  Raak: 0.4572 ** 2 * 8 * 8,
  Fon: 0.4572 ** 2,
};

const toMeters: Record<string, number> = {
  Meter: 1,
  Centimeter: 0.01,
  Foot: 0.3048,
  Inch: 0.0254,
  Nol: 3.6576,
  Haat: 0.4572,
};

type Result = {
  id: string;
  date: string;
  length: number;
  breadth: number;
  area: number;
  totalArea: number;
  unit: string;
  quantity: number;
  rate: number;
  rateUnit: string;
  price: number;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder = '0',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          dropdownIconColor="#64748B"
        >
          {options.map(option => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

export default function App() {
  const [l1, setL1] = useState('0');
  const [l2, setL2] = useState('0');
  const [b1, setB1] = useState('0');
  const [b2, setB2] = useState('0');

  const [lu1, setLu1] = useState('Meter');
  const [lu2, setLu2] = useState('Meter');
  const [bu1, setBu1] = useState('Meter');
  const [bu2, setBu2] = useState('Meter');

  const [quantity, setQuantity] = useState('1');
  const [areaUnit, setAreaUnit] = useState('Square Meter');
  const [rate, setRate] = useState('0');
  const [rateUnit, setRateUnit] = useState('Square Meter');

  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('land-calculator-history')
      .then(value => {
        if (value) setHistory(JSON.parse(value));
      })
      .catch(() => Alert.alert('Error', 'Could not load calculation history.'));
  }, []);

  const fmt = (value: number) =>
    Number(value.toFixed(4)).toLocaleString('en-IN');

  const currency = (value: number) =>
    '₹' +
    value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });

  const calculate = async () => {
    const values = [l1, l2, b1, b2, quantity, rate].map(Number);

    if (values.some(value => !Number.isFinite(value) || value < 0)) {
      Alert.alert('Invalid input', 'Enter valid, non-negative numbers.');
      return;
    }

    const [a, c, d, e, q, r] = values;

    const length = a * toMeters[lu1] + c * toMeters[lu2];
    const breadth = d * toMeters[bu1] + e * toMeters[bu2];
    const area = length * breadth;

    const areaInSelectedUnit = area / AREA_FACTORS[areaUnit];
    const price = (area / AREA_FACTORS[rateUnit]) * q * r;

    const item: Result = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      length,
      breadth,
      area: areaInSelectedUnit,
      totalArea: areaInSelectedUnit * q,
      unit: areaUnit,
      quantity: q,
      rate: r,
      rateUnit,
      price,
    };

    setResult(item);
    setShowHistory(false);

    if (area > 0) {
      const updated = [item, ...history].slice(0, 100);
      setHistory(updated);

      try {
        await AsyncStorage.setItem(
          'land-calculator-history',
          JSON.stringify(updated),
        );
      } catch {
        Alert.alert(
          'Warning',
          'Result calculated, but history could not be saved.',
        );
      }
    }
  };

  const clearInputs = () => {
    setL1('0');
    setL2('0');
    setB1('0');
    setB2('0');
    setQuantity('1');
    setRate('0');
    setResult(null);
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear history?',
      'This permanently removes saved calculations.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('land-calculator-history');
            setHistory([]);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Land Calculator</Text>
          <Text style={styles.subtitle}>Measure. Calculate. Estimate.</Text>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Text style={styles.historyButtonText}>
            {showHistory ? 'Calculator' : 'History'}
          </Text>
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Calculation History</Text>
          {history.length === 0 ? (
            <Text style={styles.empty}>No calculations saved yet.</Text>
          ) : (
            history.map(item => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <ResultRow
                  label="Area"
                  value={`${fmt(item.area)} ${item.unit}`}
                />
                <ResultRow
                  label="Total area"
                  value={`${fmt(item.totalArea)} ${item.unit}`}
                />
                <ResultRow label="Quantity" value={String(item.quantity)} />
                <ResultRow label="Total price" value={currency(item.price)} />
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setResult(item);
                    setShowHistory(false);
                  }}
                >
                  <Text style={styles.secondaryText}>View result</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearHistory}
              onPress={clearHistory}
            >
              <Text style={styles.clearText}>Clear history</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.heading}>Dimensions</Text>
            <Text style={styles.help}>
              Add two length measurements and two breadth measurements.
            </Text>

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Field label="Length 1" value={l1} onChangeText={setL1} />
                <Select
                  label="Unit"
                  value={lu1}
                  options={LENGTH_UNITS}
                  onChange={setLu1}
                />
              </View>
              <View style={styles.column}>
                <Field label="Length 2" value={l2} onChangeText={setL2} />
                <Select
                  label="Unit"
                  value={lu2}
                  options={LENGTH_UNITS}
                  onChange={setLu2}
                />
              </View>
              <View style={styles.column}>
                <Field label="Breadth 1" value={b1} onChangeText={setB1} />
                <Select
                  label="Unit"
                  value={bu1}
                  options={LENGTH_UNITS}
                  onChange={setBu1}
                />
              </View>
              <View style={styles.column}>
                <Field label="Breadth 2" value={b2} onChangeText={setB2} />
                <Select
                  label="Unit"
                  value={bu2}
                  options={LENGTH_UNITS}
                  onChange={setBu2}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Area & Pricing</Text>

            <Field
              label="Number of plots / quantity"
              value={quantity}
              onChangeText={setQuantity}
            />
            <Select
              label="Display area in"
              value={areaUnit}
              options={AREA_UNITS}
              onChange={setAreaUnit}
            />
            <Field
              label="Rate per selected area unit (₹)"
              value={rate}
              onChangeText={setRate}
            />
            <Select
              label="Rate unit"
              value={rateUnit}
              options={AREA_UNITS}
              onChange={setRateUnit}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={calculate}>
              <Text style={styles.primaryText}>Calculate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={clearInputs}
            >
              <Text style={styles.secondaryText}>Clear inputs</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultHeading}>Calculation Result</Text>
              <Text style={styles.bigNumber}>{fmt(result.totalArea)}</Text>
              <Text style={styles.unitText}>{result.unit} total area</Text>
              <View style={styles.separator} />
              <ResultRow label="Length" value={`${fmt(result.length)} m`} />
              <ResultRow label="Breadth" value={`${fmt(result.breadth)} m`} />
              <ResultRow
                label="Single plot area"
                value={`${fmt(result.area)} ${result.unit}`}
              />
              <ResultRow label="Quantity" value={String(result.quantity)} />
              <ResultRow
                label="Total area"
                value={`${fmt(result.totalArea)} ${result.unit}`}
              />
              <ResultRow
                label="Estimated price"
                value={currency(result.price)}
              />
            </View>
          )}

          <Text style={styles.footer}>
            Land Calculator · Calculations are stored on this device.
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { color: '#C7D2FE', marginTop: 3, fontSize: 12 },
  historyButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  historyButtonText: { color: '#4338CA', fontWeight: '700' },
  content: { padding: 16, paddingBottom: 36 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  help: { color: '#64748B', fontSize: 12, marginTop: 6, marginBottom: 12 },
  twoColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  column: { width: '48%', flexGrow: 1, flexShrink: 1 },
  field: { marginTop: 12 },
  label: { color: '#475569', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 2,
  },
  picker: { height: 50, color: '#0F172A' },
  primaryButton: {
    marginTop: 20,
    backgroundColor: '#4338CA',
    borderRadius: 12,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  secondaryText: { color: '#4338CA', fontWeight: '700' },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  resultHeading: { color: '#4338CA', fontSize: 18, fontWeight: '800' },
  bigNumber: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 14,
  },
  unitText: { color: '#64748B', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 14 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    gap: 12,
  },
  resultLabel: { color: '#64748B', flex: 1, fontSize: 13 },
  resultValue: {
    color: '#0F172A',
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  historyDate: { color: '#64748B', fontSize: 12, marginBottom: 8 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 30 },
  clearHistory: {
    padding: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
  },
  clearText: { color: '#B91C1C', fontWeight: '700' },
  footer: { color: '#94A3B8', textAlign: 'center', fontSize: 12, marginTop: 8 },
});
