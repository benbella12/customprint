import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import style from './bsstyle.css';
import axios from 'axios';
const BonDeSortiePrint = () => {
  const { id } = useParams();
  const [ref, setRef] = useState('');
  const [date, setDate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pallete, setPallete] = useState('');
  const [caisse, setCaisse] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [destination, setDestination] = useState('');
  const [domaine, setDomaine] = useState('');
  const [articles, setArticles] = useState([]);
  const [totalCaisse, setTotalCaisse] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [chauffeur, setChauffeur] = useState('');
  const [matricule, setMatricule] = useState('');
  const [traitments, setTraitments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = '28|lJQJ92yXO6g24klKc667GGPoTxbwwZnwo6WVPedg08fbc404';
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get('http://192.168.1.235:80/api/bonsortie/' + id, config);
        const parsedDate = dayjs(response.data.bs_date);
        const formattedDate = parsedDate.format('DD/MM/YYYY');
        setRef(response.data.ref);
        setDate(formattedDate);
        setTemperature(response.data.temperature);
        setPallete(response.data.number_pallet);
        setCaisse(response.data.number_tray);
        setHarvestDate(formatDateTime(response.data.harvest_start_date));
        setDestination(response.data.client.name);
        setDomaine(response.data.farm && response.data.farm.name);
        setChauffeur(response.data.driver_name);
        setMatricule(response.data.driver_registration_number);
        const mappedData = response.data.details.map((item) => {
          setTotalCaisse((prevTotal) => prevTotal + item.harvest_tray);
          setTotalKg((prevTotal) => prevTotal + item.harvest_kg);
          return {
            harvestCaisse: item.harvest_tray,
            harvestKg: item.harvest_kg,
            bloc: item.harvest.parcel.bloc_id && item.harvest.parcel.bloc ? item.harvest.parcel.bloc.name : null,
            variety: item.harvest.parcel && item.harvest.parcel.variety.name,
            article: item.harvest.parcel.variety.crops && item.harvest.parcel.variety.crops.name,
            serre: item.harvest.parcel && item.harvest.parcel.name
          };
        });

        const phytosanitaires = response.data.phytosanitary.map((item) => {
          return {
            bloc: item.parcel.bloc_id && item.parcel.bloc ? item.parcel.name : null,
            serre: item.parcel && item.parcel.name,
            last_treatment: formatDateTime(item.last_treatment),
            dar: item.pesticide && item.pesticide.dar,
            active_ingredients: item.pesticide && item.pesticide.active_ingredients,
            name: item.pesticide && item.pesticide.name_commercial
          };
        });
        setArticles(mappedData);
        setTraitments(phytosanitaires);

        var dataCouter = 0;
        var page = generateDiv();
        createHeader(page);

        generatePrintContent(response.data, page);
        var tableElement = null;
         var totalKg = null;
        var totalTray = null;
        for (let i = 0; i < mappedData.length; i++) {
          if (i == 0 || dataCouter == 20) {
            if (i != 0) {
              page = generateDiv();
              createHeader(page);
            }
            tableElement = document.createElement('table');
          }
          totalKg = totalKg + mappedData[i].harvestKg;
          totalTray = totalTray + mappedData[i].harvestCaisse;
          generateArticle(dataCouter, tableElement, page, mappedData[i], i == mappedData.length - 1 ? totalKg : null, totalTray);

          dataCouter++;
        }
        

        for (let i = 0; i < phytosanitaires.length; i++) {
          if (i == 0) {
             var initialArticle = document.createElement('article');
             var initialTable = document.createElement('table');
          }
          generatePhytosanitaryTable(i, initialTable, initialArticle, phytosanitaires[i]);
          dataCouter += 2;
          if (i == phytosanitaires.length - 1) {
            // Append the table to the article
            initialArticle.appendChild(initialTable);

            // Append the article to the page
            page.appendChild(initialArticle);
          }
        }

        if (dataCouter > 15) {
          page = generateDiv();
          createHeader(page);
        }
          generateTransportFooter(page, 'John Doe', 'ABC123', '2023-12-25 10:00 AM');
   
        // setTimeout(() => {
        //   window.print();
        // }, 2000);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const createHeader = (page) => {
    // Create header element
    var header = document.createElement('header');
    header.className = 'print-header';

    // Create sections and elements
    var section1 = document.createElement('div');
    section1.className = 'section';
    var img = document.createElement('img');
    img.src = 'https://gapp.mahaintaj.com/logo.png';
    img.alt = '';
    section1.appendChild(img);

    var divider1 = document.createElement('div');
    divider1.className = 'divider';

    var section2 = document.createElement('div');
    section2.className = 'section large';
    var h1 = document.createElement('h1');
    h1.textContent = 'Bon de livraison';
    section2.appendChild(h1);

    var divider2 = document.createElement('div');
    divider2.className = 'divider';

    var section3 = document.createElement('div');
    section3.className = 'section right';
    var p1 = document.createElement('p');
    p1.textContent = 'Réf: N° F3. Cntr, Res';
    var divider3 = document.createElement('div');
    divider3.className = 'divider horizontal';
    var p2 = document.createElement('p');
    p2.textContent = 'version: 12 Octobre 2023';
    var divider4 = document.createElement('div');
    divider4.className = 'divider horizontal';
    var p3 = document.createElement('p');
    p3.textContent = 'page: 1/1';

    section3.appendChild(p1);
    section3.appendChild(divider3);
    section3.appendChild(p2);
    section3.appendChild(divider4);
    section3.appendChild(p3);

    // Append elements to header
    header.appendChild(section1);
    header.appendChild(divider1);
    header.appendChild(section2);
    header.appendChild(divider2);
    header.appendChild(section3);

    // Append header to the body
    page.appendChild(header);
  };

  const generateDiv = () => {
    const divElement = document.createElement('div');
    divElement.className = 'page';
    document.body.appendChild(divElement);
    return divElement;
  };

  const generateArticle = (i, tableElement, page, articles, totalKg, totalTray) => {
    const articleElement = document.createElement('article');

    tableElement.className = 'harvests';

    if (i == 0) {
      // Table Header
      const theadElement = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Article', 'Variété', 'Bloc', 'Serre', 'Caisse', 'Poids (kg)'].forEach((headerText) => {
        const thElement = document.createElement('th');
        thElement.textContent = headerText;
        headerRow.appendChild(thElement);
      });
      theadElement.appendChild(headerRow);
      tableElement.appendChild(theadElement);
    }
    // Table Body
    const tbodyElement = document.createElement('tbody');

    const row = document.createElement('tr');
    ['article', 'variety', 'bloc', 'serre', 'harvestCaisse', 'harvestKg'].forEach((fieldName) => {
      const tdElement = document.createElement('td');
      tdElement.textContent = articles[fieldName];
      row.appendChild(tdElement);
    });
    tbodyElement.appendChild(row);

    if (totalKg != null) {
      // Total Row
      const totalRow = document.createElement('tr');
      const totalColSpan = 4; // Assuming you want the "Total" label to span 4 columns
      const totalTh = document.createElement('th');
      totalTh.setAttribute('colSpan', totalColSpan);
      totalTh.textContent = 'Total';
      totalRow.appendChild(totalTh);
      const totalCaisseTd = document.createElement('td');
      totalCaisseTd.textContent = totalTray;
      totalRow.appendChild(totalCaisseTd);
      const totalKgTd = document.createElement('td');
      totalKgTd.textContent = totalKg;
      totalRow.appendChild(totalKgTd);
      tbodyElement.appendChild(totalRow);
    }

    tableElement.appendChild(tbodyElement);

    articleElement.appendChild(tableElement);
    if (totalKg != null) {
      page.appendChild(articleElement);
    }
  };

  const generatePrintContent = (data, page) => {
    const printContentDiv = document.createElement('div');
    printContentDiv.className = 'print-content';

    const leftTable = generateTable(
      [
        ['Domaine', data.farm && data.farm.name],
        ['Destination', data.client.name],
        ['Nbre de palettes', data.number_pallet],
        ['Nombre de caisses', data.number_tray]
      ],
      'meta left'
    );
    const parsedDate = dayjs(data.bs_date);
    const formattedDate = parsedDate.format('DD/MM/YYYY');

    const rightTable = generateTable(
      [
        ['Référence', data.ref],
        ['Date', formattedDate],
        ['Température', `${data.temperature}°C`],
        ['Date début de récolte', formatDateTime(data.harvest_start_date)]
      ],
      'meta'
    );

    printContentDiv.appendChild(leftTable);
    printContentDiv.appendChild(rightTable);

    page.appendChild(printContentDiv);
  };

  const generateTable = (rows, className) => {
    const table = document.createElement('table');
    table.className = className;

    rows.forEach(([header, value]) => {
      const row = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = header;
      const td = document.createElement('td');
      td.textContent = value;
      row.appendChild(th);
      row.appendChild(td);
      table.appendChild(row);
    });

    return table;
  };

  const generatePhytosanitaryTable = (i, table, article, data) => {
    if (i === 0) {
      const heading = document.createElement('h2');
      heading.textContent = 'traitements phytosanitaires :';
      article.appendChild(heading);
      article.appendChild(document.createElement('br'));

      table.className = 'phytosanitary';

      // Table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['Bloc', 'Serre', 'Date du dernier traitement', 'Nom de produit', 'Matière active', 'DAR'].forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
    }

    // Table body
    const tbody = table.querySelector('tbody') || document.createElement('tbody');

    const row = document.createElement('tr');
    ['bloc', 'serre', 'last_treatment', 'name', 'active_ingredients', 'dar'].forEach((key) => {
      const td = document.createElement('td');
      td.textContent = data[key];
      row.appendChild(td);
    });
    tbody.appendChild(row);

    table.appendChild(tbody);
  };

  const generateTransportFooter = (page, chauffeur, matricule, harvestDate) => {
    const footer = document.createElement('footer');

    const transportArticle = document.createElement('article');
    const transportHeading = document.createElement('h2');
    transportHeading.textContent = 'Information de transport :';
    transportArticle.appendChild(transportHeading);
    transportArticle.appendChild(document.createElement('br'));

    const transportTable = document.createElement('table');
    transportTable.className = 'transport';

    // Table header
    const transportThead = document.createElement('thead');
    const transportHeaderRow = document.createElement('tr');
    ['Chauffeur', 'Matricule', 'Date et heure'].forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      transportHeaderRow.appendChild(th);
    });
    transportThead.appendChild(transportHeaderRow);
    transportTable.appendChild(transportThead);

    // Table body
    const transportTbody = document.createElement('tbody');
    const transportRow = document.createElement('tr');
    [chauffeur, matricule, harvestDate].forEach((data) => {
      const td = document.createElement('td');
      td.textContent = data;
      transportRow.appendChild(td);
    });
    transportTbody.appendChild(transportRow);
    transportTable.appendChild(transportTbody);

    transportArticle.appendChild(transportTable);
    footer.appendChild(transportArticle);

    // Bottom section
    const bottomSectionDiv = document.createElement('div');
    bottomSectionDiv.className = 'bottomSection';

    // Signature section
    const signatureDiv = document.createElement('div');
    signatureDiv.className = 'signature';
    const signatureHeading = document.createElement('h2');
    signatureHeading.textContent = 'Signature :';
    signatureDiv.appendChild(signatureHeading);
    signatureDiv.appendChild(document.createElement('br'));

    const signatureTable = document.createElement('table');
    const signatureThead = document.createElement('thead');
    const signatureHeaderRow = document.createElement('tr');
    ['Chauffeur', 'Émetteur', 'Receveur'].forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      signatureHeaderRow.appendChild(th);
    });
    signatureThead.appendChild(signatureHeaderRow);
    signatureTable.appendChild(signatureThead);

    const signatureTbody = document.createElement('tbody');
    const signatureRow = document.createElement('tr');
    Array.from({ length: 3 }).forEach(() => {
      const td = document.createElement('td');
      signatureRow.appendChild(td);
    });
    signatureTbody.appendChild(signatureRow);
    signatureTable.appendChild(signatureTbody);

    signatureDiv.appendChild(signatureTable);

    // QR Code section
    const qrCodeDiv = document.createElement('div');
    qrCodeDiv.className = 'qrCode';
    const qrCodeImg = document.createElement('img');
    qrCodeImg.alt = '';
    qrCodeImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=BS2300012';
    qrCodeDiv.appendChild(qrCodeImg);

    bottomSectionDiv.appendChild(signatureDiv);
    bottomSectionDiv.appendChild(qrCodeDiv);

    footer.appendChild(bottomSectionDiv);

    page.appendChild(footer);
  };
  return <div></div>;
};

export default BonDeSortiePrint;
