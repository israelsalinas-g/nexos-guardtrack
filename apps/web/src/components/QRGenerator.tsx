'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  qrCard: {
    width: '45%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
    alignItems: 'center',
  },
  qrImage: {
    width: 150,
    height: 150,
  },
  qrName: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },
});

interface ControlPoint {
  name: string;
  qr_token: string;
}

// PDF Document component
const MyDocument = ({ establishmentName, points, qrImages }: { establishmentName: string, points: ControlPoint[], qrImages: string[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Puntos de Control - {establishmentName}</Text>
      <View style={styles.qrContainer}>
        {points.map((point, index) => (
          <View key={point.qr_token} style={styles.qrCard}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrImages[index]} style={styles.qrImage} />
            <Text style={styles.qrName}>{point.name}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export function QRDownloadButton({ establishmentName, points }: { establishmentName: string, points: ControlPoint[] }) {
  const [qrImages, setQrImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const generateQRs = async () => {
      const images = await Promise.all(
        points.map(p => QRCode.toDataURL(p.qr_token, { width: 300, margin: 2 }))
      );
      setQrImages(images);
      setLoading(false);
    };
    generateQRs();
  }, [points]);

  if (loading) return <span>Generando QRs...</span>;

  return (
    <PDFDownloadLink
      document={<MyDocument establishmentName={establishmentName} points={points} qrImages={qrImages} />}
      fileName={`QRs-${establishmentName}.pdf`}
      className="button-primary"
      style={{ textDecoration: 'none' }}
    >
      {({ loading: pdfLoading }) => (pdfLoading ? 'Preparando PDF...' : 'Descargar PDF de QRs')}
    </PDFDownloadLink>
  );
}
