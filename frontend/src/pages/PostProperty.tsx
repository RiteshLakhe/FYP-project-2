import { useNavigate } from "react-router";


const PostProperty = () => {
  const navigate = useNavigate();

  return (
    <div className="page-reveal w-full h-[800px] flex items-center justify-center">
      <div className="w-3/4 text-center space-y-10">
        <h1 className="section-reveal text-6xl font-semibold">
          Turn Your Extra Space into Extra Income with RentEase
        </h1> 
        <p className="section-reveal stagger-1 text-lg">
          Got a room, flat, or commercial space sitting idle? Put it to work —
          list your property today and start earning.
        </p>
        <button className="section-reveal stagger-2 button-pop font-medium border px-8 py-4 bg-[#1E293B] text-white rounded-sm" onClick={() => navigate("/landlord/addPropertyForm")}>List your Property</button>
      </div>
    </div>
  );
};

export default PostProperty;
