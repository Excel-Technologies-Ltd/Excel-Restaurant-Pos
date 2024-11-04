import Input from "../../components/form-elements/Input";
import Password from "../../components/form-elements/Password";
import Button from "../../components/Button/Button";
import { useNavigate } from "react-router";

const Login = () => {
    const navigate = useNavigate();
    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate("/");
    }
    return (
        <div className="h-screen w-full bg-bg sm:p-5 overflow-auto">
            <div className="max-w-[500px] h-full sm:h-auto sm:mt-[40px] md:mt-[80px] bg-whiteColor w-full rounded px-5 sm:px-10 py-10 flex flex-col justify-top items-center main-body relative m-auto">
                {/* <ModeSwitcher /> */}
                {/* {isWhite ? (
                    <img
                        src="/logo.png"
                        className="w-[130px] object-contain sm:w-[200px]"
                        alt=""
                    />
                ) : ( */}
                <img
                    src="/logo-white.png"
                    className="w-[130px] object-contain sm:w-[200px]"
                    alt=""
                />
                {/* )} */}

                <div className="mt-5 sm:mt-10 w-auto">
                    <div className="flex gap-4 items-center justify-between w-full">
                        <img className="object-contain" src="/title-img.png" alt="" />
                        <h1 className="text-[18px] sm:text-[30px] font-[700] text-primaryColor">
                            Welcome to Restaurant POS
                        </h1>
                    </div>
                </div>

                <div className="mt-5 sm:mt-10 w-full">
                    <div className="relative flex w-full items-center justify-center">
                        <p className="bg-whiteColor text-[#00000080] text-[14px] sm:text-[15px] px-1 sm:px-3 relative z-10">
                            Login with Username or Email
                        </p>
                        <div className="w-full absolute h-[1px] bg-borderColor -z-1" />
                    </div>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="mt-8 w-full flex flex-col gap-5"
                >
                    <Input
                        label={"Username / Email"}
                        required
                    // value={mailOrNumber}
                    // type="email"
                    // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    //     setMailOrNumber(e.target.value)
                    // }
                    />
                    <Password
                        label={"Password"}
                        required
                    // value={password}
                    // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    //     setPassword(e.target.value)
                    // }
                    />
                    <Button
                        label={"Login"}
                        type="submit"
                    // isLoading={isLoading}
                    />
                </form>

            </div>
        </div>
    );

};

export default Login;
