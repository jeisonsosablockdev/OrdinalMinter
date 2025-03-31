import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ordinalService, CollectionItem } from "@/lib/ordinalService";

interface CollectionGalleryProps {
  collectionName: string;
}

const CollectionGallery: React.FC<CollectionGalleryProps> = ({ collectionName }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/collection/${collectionName}/items`, currentPage],
    queryFn: () => ordinalService.getCollectionItems(collectionName, currentPage, 10)
  });
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (data && currentPage < data.pagination.pages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };
  
  const renderPagination = () => {
    if (!data) return null;
    
    const { pagination } = data;
    const pages = [];
    
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(
        <Button
          key={i}
          className={`p-2 w-10 h-10 rounded-md ${
            i === currentPage
              ? "bg-primary text-gray-900 font-medium"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </Button>
      );
    }
    
    return (
      <nav className="flex items-center space-x-1">
        <Button
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <span className="material-icons">chevron_left</span>
        </Button>
        {pages}
        <Button
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50"
          onClick={handleNextPage}
          disabled={currentPage === pagination.pages}
        >
          <span className="material-icons">chevron_right</span>
        </Button>
      </nav>
    );
  };
  
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t("gallery.title")}</h2>
        <div className="flex items-center">
          <Button
            variant="ghost"
            className={`text-gray-400 hover:text-white p-2 ${viewMode === "grid" ? "text-white" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <span className="material-icons">grid_view</span>
          </Button>
          <Button
            variant="ghost"
            className={`text-gray-400 hover:text-white p-2 ${viewMode === "list" ? "text-white" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <span className="material-icons">view_list</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{t("errors.failedToLoadCollection")}</p>
        </div>
      ) : (
        <>
          {/* Collection Grid */}
          <div className={`
            ${viewMode === "grid" 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
              : "space-y-4"
            }
          `}>
            {data?.items.map((item) => (
              viewMode === "grid" ? (
                <div 
                  key={item.ordinalId} 
                  className="bg-background rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-gray-800">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.mintFee.toLocaleString()} sats</p>
                  </div>
                </div>
              ) : (
                <div 
                  key={item.ordinalId} 
                  className="flex items-center bg-background rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all cursor-pointer p-2"
                >
                  <div className="h-16 w-16 bg-gray-800 mr-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.mintFee.toLocaleString()} sats</p>
                  </div>
                  <div className="ml-auto">
                    {item.isMinted ? (
                      <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                        {t("common.minted")}
                      </span>
                    ) : (
                      <span className="bg-blue-500/20 text-blue-500 text-xs px-2 py-1 rounded-full">
                        {t("common.available")}
                      </span>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-center mt-8">
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
};

export default CollectionGallery;
