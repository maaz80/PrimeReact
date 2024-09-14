import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import 'tailwindcss/tailwind.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(12);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectNumber, setSelectNumber] = useState<number>(0);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const fetchedArtworks = data.data.map((artwork: any) => ({
        id: artwork.id,
        title: artwork.title,
        place_of_origin: artwork.place_of_origin,
        artist_display: artwork.artist_display,
        inscriptions: artwork.inscriptions,
        date_start: artwork.date_start,
        date_end: artwork.date_end,
      }));
      setTotalRecords(data.pagination.total);
      return fetchedArtworks;
    } catch (error) {
      console.error('Error fetching artworks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(currentPage).then((data) => {
      setArtworks(data);
    });
  }, [currentPage]);

  const onPageChange = (event: any) => {
    setCurrentPage(event.page + 1);
  };
 // General type for DataTable selection change
 const onSelectionChange = (e: { value: Artwork[] }) => {
  setSelectedArtworks(e.value);
};

  const onChevronClick = (event: React.MouseEvent) => {
    overlayPanelRef.current?.toggle(event);
  };

  const onSubmitNumber = async () => {
    let numberToSelect = selectNumber;
    let newSelectedArtworks: Artwork[] = [...selectedArtworks];

    let currentIndex = 0;
    while (numberToSelect > 0 && currentIndex < artworks.length) {
      const artwork = artworks[currentIndex];
      if (!newSelectedArtworks.some((item) => item.id === artwork.id)) {
        newSelectedArtworks.push(artwork);
        numberToSelect--;
      }
      currentIndex++;
    }

    let nextPage = currentPage + 1;
    while (numberToSelect > 0) {
      const additionalArtworks = await fetchArtworks(nextPage);
      let additionalIndex = 0;

      while (numberToSelect > 0 && additionalIndex < additionalArtworks.length) {
        const artwork = additionalArtworks[additionalIndex];
        if (!newSelectedArtworks.some((item) => item.id === artwork.id)) {
          newSelectedArtworks.push(artwork);
          numberToSelect--;
        }
        additionalIndex++;
      }
      nextPage++;
    }

    setSelectedArtworks(newSelectedArtworks);
    overlayPanelRef.current?.hide();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">PrimeReact Assignment</h1>
      <div className="overflow-x-auto">
        <DataTable
          value={artworks}
          paginator={false}
          loading={loading}
          selection={selectedArtworks}
          onSelectionChange={onSelectionChange}
          selectionMode="multiple"
          dataKey="id"
          className="border-separate border-spacing-0 border border-gray-300"
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '2.5rem' }}
            className="border-b border-gray-300"
          ></Column>
          <Column
            header={<Button icon="pi pi-chevron-down" className="p-button-text" onClick={onChevronClick} />}
            bodyStyle={{ textAlign: 'center' }}
            headerStyle={{ width: '2.5rem' }}
            className="border-b border-gray-300 "
          ></Column>
          <Column
            field="title"
            header="Title"
            sortable
            className="border-b border-gray-300 w-32 md:w-40"
          ></Column>
          <Column
            field="place_of_origin"
            header="Place of Origin"
            sortable
            className="border-b border-gray-300"
          ></Column>
          <Column
            field="artist_display"
            header="Artist Display"
            sortable
            className="border-b border-gray-300 w-60 md:w-80"
          ></Column>
          <Column
            field="inscriptions"
            header="Inscriptions"
            sortable
            className="border-b border-gray-300 w-64 md:w-96"
          ></Column>
          <Column
            field="date_start"
            header="Date Start"
            sortable
            className="border-b border-gray-300"
          ></Column>
          <Column
            field="date_end"
            header="Date End"
            sortable
            className="border-b border-gray-300"
          ></Column>
        </DataTable>
      </div>
      <Paginator
        first={(currentPage - 1) * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        className="mt-4"
      />
      <OverlayPanel ref={overlayPanelRef} style={{ width: '100%', maxWidth: '300px' }}>
        <div className="p-grid p-fluid gap-2">
          <div className="p-col-12">
            <InputNumber
              value={selectNumber}
              onValueChange={(e) => setSelectNumber(e.value || 0)}
              placeholder="Enter number of rows to select"
              className='border border-gray-300 rounded-sm mb-1 '
            />
          </div>
          <div className="p-col-12 flex justify-end">
            <Button label="Submit" onClick={onSubmitNumber} className='border border-gray-300 rounded-md w-20' />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
};

export default ArtworksTable;
