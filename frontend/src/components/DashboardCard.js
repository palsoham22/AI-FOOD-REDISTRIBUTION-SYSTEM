function DashboardCard({

    title,
    value,
    color,
    onClick

}) {

    return (

        <div

            className="card shadow-sm h-100 border-0"

            onClick={onClick}

            style={{

                borderTop:`5px solid ${color}`,

                borderRadius:"18px",

                minHeight:"170px",

                transition:"all .3s ease",

                cursor:onClick ? "pointer" : "default",

                overflow:"hidden"

            }}

            onMouseEnter={(e)=>{

                e.currentTarget.style.transform="translateY(-8px)";

                e.currentTarget.style.boxShadow=

                    "0 18px 35px rgba(0,0,0,.15)";

            }}

            onMouseLeave={(e)=>{

                e.currentTarget.style.transform="translateY(0px)";

                e.currentTarget.style.boxShadow="";

            }}

        >

            <div

                className="card-body d-flex flex-column justify-content-center align-items-center text-center"

            >

                <h5

                    className="fw-semibold"

                    style={{

                        marginBottom:"18px",

                        color:"#334155",

                        lineHeight:"1.4"

                    }}

                >

                    {title}

                </h5>

                <h1

                    className="fw-bold"

                    style={{

                        color:color,

                        fontSize:"42px"

                    }}

                >

                    {value}

                </h1>

                {

                    onClick &&

                    <small

                        style={{

                            marginTop:"14px",

                            color:"#6b7280",

                            fontWeight:"600"

                        }}

                    >

                        Click to View →

                    </small>

                }

            </div>

        </div>

    );

}

export default DashboardCard;