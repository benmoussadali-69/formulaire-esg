'use client';

interface PageHeaderProps {
  showLine?: boolean;
}

export default function PageHeader({ showLine = true }: PageHeaderProps) {
  return (
          <div className="bg-[#06438a]">
        <div className="pl-[310px] pr-[310px] pt-[100px] pb-[100px] text-white">
          
       

    <div className="flex justify-center">
      <div >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-semibold leading-tight break-words">
          ÉVALUATION PRÉLIMINAIRE DE LA CONFORMITÉ<br />AU RÉFÉRENTIEL ESG 1000®
        </h1>
        {showLine && (
          <div className="w-12 h-1 bg-white mt-4"></div>
        )}
      </div>
    </div>
     </div>
      </div>
  );
}